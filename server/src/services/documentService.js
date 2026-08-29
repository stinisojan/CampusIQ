const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const { extractTextFromFile } = require('../ingestion/textExtractor');
const { createChunksFromPages } = require('../ingestion/chunker');
const { generateBatchEmbeddings } = require('./embeddingService');
const { getVectorStore } = require('../config/vectorStore');
const { emitDocumentStatus } = require('../config/socket');

/**
 * Executes the entire document ingestion pipeline asynchronously
 * @param {string} documentId
 */
const processDocumentIngestion = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    console.error(`[DocumentService] Document ${documentId} not found for ingestion`);
    return;
  }

  try {
    // 1. Text Extraction & Status Update -> CHUNKING
    document.processingStatus = 'CHUNKING';
    await document.save();
    emitDocumentStatus(document._id, 'CHUNKING', {
      filename: document.originalName,
      message: 'Extracting text and chunking document...',
    });

    console.log(`[DocumentService] Extracting text from ${document.originalName}...`);
    const { text, pages, numPages } = await extractTextFromFile(document.storagePath, document.mimeType);

    // 2. Chunking
    const rawChunks = createChunksFromPages(pages, {
      department: document.department,
      filename: document.originalName,
    });

    if (rawChunks.length === 0) {
      throw new Error('No readable text content extracted from document.');
    }

    console.log(`[DocumentService] Extracted ${rawChunks.length} chunks from ${document.originalName}.`);

    // 3. Status Update -> EMBEDDING
    document.processingStatus = 'EMBEDDING';
    document.chunkCount = rawChunks.length;
    await document.save();
    emitDocumentStatus(document._id, 'EMBEDDING', {
      filename: document.originalName,
      chunkCount: rawChunks.length,
      message: `Generating vector embeddings for ${rawChunks.length} chunks...`,
    });

    // 4. Generate embeddings
    const chunkTexts = rawChunks.map((c) => c.text);
    const embeddings = await generateBatchEmbeddings(chunkTexts);

    // 5. Clean up any previous chunks for this document if reindexing
    await Chunk.deleteMany({ documentId: document._id });
    const vectorStore = getVectorStore();
    await vectorStore.deleteByDocumentId(document._id);

    // 6. Save Chunks to MongoDB & Vector Store
    const chunkRecordsToSave = [];
    const vectorRecordsToUpsert = [];

    for (let i = 0; i < rawChunks.length; i++) {
      const c = rawChunks[i];
      const vectorId = `${document._id}_chunk_${c.chunkIndex}_${uuidv4().slice(0, 8)}`;
      const emb = embeddings[i];

      chunkRecordsToSave.push({
        documentId: document._id,
        chunkIndex: c.chunkIndex,
        text: c.text,
        page: c.page,
        section: c.section,
        vectorId,
        embedding: emb,
        department: document.department,
        filename: document.originalName,
      });

      vectorRecordsToUpsert.push({
        vectorId,
        embedding: emb,
        metadata: {
          documentId: String(document._id),
          chunkIndex: c.chunkIndex,
          text: c.text,
          page: c.page,
          section: c.section,
          department: document.department,
          filename: document.originalName,
        },
      });
    }

    await Chunk.insertMany(chunkRecordsToSave);
    await vectorStore.upsert(vectorRecordsToUpsert);

    // 7. Status Update -> INDEXED
    document.processingStatus = 'INDEXED';
    document.chunkCount = rawChunks.length;
    document.errorMessage = '';
    // Generate brief preview summary if text exists
    document.summary = text.slice(0, 200).replace(/\s+/g, ' ').trim() + '...';
    await document.save();

    emitDocumentStatus(document._id, 'INDEXED', {
      filename: document.originalName,
      chunkCount: rawChunks.length,
      message: `Document successfully indexed with ${rawChunks.length} chunks.`,
    });

    console.log(`[DocumentService] Successfully indexed document ${document.originalName} (${document._id})`);
  } catch (error) {
    console.error(`[DocumentService] Ingestion failed for document ${documentId}:`, error);
    document.processingStatus = 'FAILED';
    document.errorMessage = error.message || 'Unknown ingestion error';
    await document.save();

    emitDocumentStatus(document._id, 'FAILED', {
      filename: document.originalName,
      errorMessage: document.errorMessage,
    });
  }
};

/**
 * Handle document file upload and initiate background ingestion
 */
const uploadDocument = async (file, user, metadata = {}) => {
  const document = await Document.create({
    filename: file.filename,
    originalName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadedBy: user?._id || user?.id,
    uploaderName: user?.name || 'Admin',
    department: metadata.department || 'General',
    category: metadata.category || 'General',
    storagePath: file.path,
    processingStatus: 'UPLOADED',
  });

  emitDocumentStatus(document._id, 'UPLOADED', {
    filename: document.originalName,
    message: 'File uploaded. Queuing for ingestion...',
  });

  // Run ingestion asynchronously in background
  processDocumentIngestion(document._id).catch((err) => {
    console.error('[DocumentService] Background ingestion unhandled error:', err);
  });

  return document;
};

/**
 * List all documents with optional department and status filtering
 */
const listDocuments = async (filters = {}) => {
  const query = {};
  if (filters.department && filters.department !== 'All') {
    query.department = filters.department;
  }
  if (filters.processingStatus) {
    query.processingStatus = filters.processingStatus;
  }

  const documents = await Document.find(query).sort({ createdAt: -1 });
  return documents;
};

/**
 * Get document by ID
 */
const getDocumentById = async (id) => {
  const document = await Document.findById(id);
  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }
  return document;
};

/**
 * Reindex a document
 */
const reindexDocument = async (id) => {
  const document = await getDocumentById(id);
  
  if (!fs.existsSync(document.storagePath)) {
    const error = new Error('Document file does not exist on storage path.');
    error.statusCode = 400;
    throw error;
  }

  document.processingStatus = 'UPLOADED';
  document.errorMessage = '';
  await document.save();

  processDocumentIngestion(document._id).catch((err) => {
    console.error('[DocumentService] Reindexing error:', err);
  });

  return document;
};

/**
 * Delete a document, its physical file, chunks, and vector store entries
 */
const deleteDocument = async (id) => {
  const document = await Document.findById(id);
  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  // Remove physical file
  try {
    if (fs.existsSync(document.storagePath)) {
      fs.unlinkSync(document.storagePath);
    }
  } catch (err) {
    console.warn(`[DocumentService] Could not remove physical file at ${document.storagePath}:`, err.message);
  }

  // Delete chunks from MongoDB
  await Chunk.deleteMany({ documentId: document._id });

  // Delete vectors from Vector Store
  const vectorStore = getVectorStore();
  await vectorStore.deleteByDocumentId(document._id);

  // Delete document record
  await Document.findByIdAndDelete(id);

  return { success: true, message: 'Document and its vector index deleted successfully.' };
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentById,
  reindexDocument,
  deleteDocument,
  processDocumentIngestion,
};
