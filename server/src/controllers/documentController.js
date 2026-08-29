const path = require('path');
const documentService = require('../services/documentService');

const listDocuments = async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const documents = await documentService.listDocuments({ department, processingStatus: status });
    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF, DOCX, TXT, or MD file.',
      });
    }

    const { department, category } = req.body;
    const document = await documentService.uploadDocument(req.file, req.user, { department, category });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for chunking & indexing.',
      document,
    });
  } catch (error) {
    next(error);
  }
};

const uploadBatchDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one PDF, DOCX, TXT, or MD file.',
      });
    }

    const { department, category } = req.body;
    const uploadedDocs = [];

    for (const file of req.files) {
      const doc = await documentService.uploadDocument(file, req.user, { department, category });
      uploadedDocs.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedDocs.length} document(s) and queued for RAG indexing.`,
      documents: uploadedDocs,
    });
  } catch (error) {
    next(error);
  }
};

const viewDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    if (!document || !document.storagePath) {
      return res.status(404).json({
        success: false,
        message: 'Document file record or storage path not found.',
      });
    }

    const filePath = path.resolve(document.storagePath);
    res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

const reindexDocument = async (req, res, next) => {
  try {
    const document = await documentService.reindexDocument(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Document reindexing started.',
      document,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDocuments,
  getDocument,
  uploadDocument,
  uploadBatchDocuments,
  viewDocument,
  reindexDocument,
  deleteDocument,
};