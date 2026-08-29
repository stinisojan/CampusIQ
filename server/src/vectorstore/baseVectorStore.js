/**
 * Base abstract class for Vector Store implementations
 */
class BaseVectorStore {
  /**
   * Upsert chunks and their embeddings
   * @param {Array<{ vectorId: string, embedding: number[], metadata: object }>} records
   * @returns {Promise<{ upsertedCount: number }>}
   */
  async upsert(records) {
    throw new Error('upsert() must be implemented by subclass');
  }

  /**
   * Perform vector similarity search
   * @param {number[]} queryEmbedding - Dense vector for query
   * @param {number} topK - Number of top chunks to return
   * @param {object} filter - Optional filter criteria (e.g. { department: 'CS' })
   * @returns {Promise<Array<{ vectorId: string, score: number, metadata: object }>>}
   */
  async query(queryEmbedding, topK = 4, filter = {}) {
    throw new Error('query() must be implemented by subclass');
  }

  /**
   * Delete all vectors associated with a specific documentId
   * @param {string} documentId
   * @returns {Promise<{ deletedCount: number }>}
   */
  async deleteByDocumentId(documentId) {
    throw new Error('deleteByDocumentId() must be implemented by subclass');
  }
}

module.exports = BaseVectorStore;
