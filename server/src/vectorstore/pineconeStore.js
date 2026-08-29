const BaseVectorStore = require('./baseVectorStore');
const config = require('../config/env');

class PineconeVectorStore extends BaseVectorStore {
  constructor() {
    super();
    this.client = null;
    this.index = null;
  }

  async getIndex() {
    if (this.index) return this.index;

    try {
      const { Pinecone } = require('@pinecone-database/pinecone');
      if (!config.PINECONE_API_KEY) {
        throw new Error('PINECONE_API_KEY is not set.');
      }
      this.client = new Pinecone({ apiKey: config.PINECONE_API_KEY });
      this.index = this.client.index(config.PINECONE_INDEX_NAME);
      return this.index;
    } catch (err) {
      console.error('[PineconeVectorStore] Error initializing Pinecone:', err.message);
      throw err;
    }
  }

  async upsert(records) {
    const index = await this.getIndex();
    // Pinecone expects array of { id, values, metadata }
    const vectors = records.map((r) => ({
      id: r.vectorId,
      values: r.embedding,
      metadata: {
        documentId: String(r.metadata.documentId),
        chunkIndex: r.metadata.chunkIndex,
        text: r.metadata.text,
        page: String(r.metadata.page || '1'),
        section: String(r.metadata.section || 'General'),
        department: String(r.metadata.department || 'General'),
        filename: String(r.metadata.filename || ''),
      },
    }));

    // Batch upsert in chunks of 100
    for (let i = 0; i < vectors.length; i += 100) {
      const batch = vectors.slice(i, i + 100);
      await index.upsert(batch);
    }

    return { upsertedCount: records.length };
  }

  async query(queryEmbedding, topK = 4, filter = {}) {
    const index = await this.getIndex();
    const queryOptions = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };

    if (filter.department && filter.department !== 'General') {
      queryOptions.filter = { department: { $eq: filter.department } };
    }

    const response = await index.query(queryOptions);
    return (response.matches || []).map((m) => ({
      vectorId: m.id,
      score: m.score,
      metadata: m.metadata,
    }));
  }

  async deleteByDocumentId(documentId) {
    const index = await this.getIndex();
    // Pinecone supports delete by metadata filter or IDs
    try {
      await index.deleteMany({ filter: { documentId: { $eq: String(documentId) } } });
      return { deletedCount: 1 };
    } catch (err) {
      console.warn('[PineconeVectorStore] Delete filter failed, falling back:', err.message);
      return { deletedCount: 0 };
    }
  }
}

module.exports = PineconeVectorStore;
