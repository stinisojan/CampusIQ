const BaseVectorStore = require('./baseVectorStore');
const Chunk = require('../models/Chunk');

/**
 * Calculates cosine similarity between two numeric vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

class MemoryVectorStore extends BaseVectorStore {
  constructor() {
    super();
    // In-memory cache: Map<vectorId, { vectorId, embedding, metadata }>
    this.vectors = new Map();
    this.initialized = false;
  }

  /**
   * Warm up cache from MongoDB Chunk records if available
   */
  async init() {
    if (this.initialized) return;
    try {
      const chunks = await Chunk.find({ embedding: { $exists: true, $ne: [] } }).lean();
      for (const chunk of chunks) {
        this.vectors.set(chunk.vectorId || String(chunk._id), {
          vectorId: chunk.vectorId || String(chunk._id),
          embedding: chunk.embedding,
          metadata: {
            documentId: String(chunk.documentId),
            chunkIndex: chunk.chunkIndex,
            text: chunk.text,
            page: chunk.page,
            section: chunk.section,
            department: chunk.department,
            filename: chunk.filename,
          },
        });
      }
      this.initialized = true;
      console.log(`[MemoryVectorStore] Loaded ${this.vectors.size} chunk vectors into memory index.`);
    } catch (err) {
      console.warn('[MemoryVectorStore] DB warmup skipped or empty:', err.message);
      this.initialized = true;
    }
  }

  async upsert(records) {
    await this.init();
    let count = 0;
    for (const record of records) {
      this.vectors.set(record.vectorId, {
        vectorId: record.vectorId,
        embedding: record.embedding,
        metadata: record.metadata,
      });
      count++;
    }
    return { upsertedCount: count };
  }

  async query(queryEmbedding, topK = 4, filter = {}) {
    await this.init();
    const results = [];

    for (const [vectorId, item] of this.vectors.entries()) {
      // Apply filters if specified
      if (filter.department && filter.department !== 'General' && item.metadata.department && item.metadata.department !== filter.department) {
        continue;
      }
      if (filter.documentId && item.metadata.documentId !== filter.documentId) {
        continue;
      }

      const score = cosineSimilarity(queryEmbedding, item.embedding);
      results.push({
        vectorId,
        score,
        metadata: item.metadata,
      });
    }

    // Sort descending by similarity score
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }

  async deleteByDocumentId(documentId) {
    await this.init();
    let count = 0;
    for (const [vectorId, item] of this.vectors.entries()) {
      if (String(item.metadata.documentId) === String(documentId)) {
        this.vectors.delete(vectorId);
        count++;
      }
    }
    return { deletedCount: count };
  }
}

module.exports = MemoryVectorStore;
