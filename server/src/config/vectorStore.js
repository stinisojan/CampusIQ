const config = require('./env');
const MemoryVectorStore = require('../vectorstore/memoryStore');
const PineconeVectorStore = require('../vectorstore/pineconeStore');

let instance = null;

const getVectorStore = () => {
  if (instance) return instance;

  if (config.VECTOR_STORE === 'pinecone' && config.PINECONE_API_KEY) {
    console.log('[VectorStore] Using Pinecone Vector Store');
    instance = new PineconeVectorStore();
  } else {
    console.log('[VectorStore] Using High-Performance Memory & Mongo Vector Store');
    instance = new MemoryVectorStore();
  }

  return instance;
};

module.exports = { getVectorStore };
