require('dotenv').config();

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusiq',
  JWT_SECRET: process.env.JWT_SECRET || 'campusiq_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // AI & RAG Configuration
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER || 'gemini',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  
  // Google API Key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // LLM Models (Standardized clean string names)
  GEMINI_MODEL: (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').replace(/^models\//, ''),
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'models/gemini-embedding-001',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  
  // Vector DB Configuration ('memory' | 'pinecone')
  VECTOR_STORE: process.env.VECTOR_STORE || 'memory',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'campusiq',
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
  
  // RAG Thresholds & Parameters
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.35'),
  TOP_K_RESULTS: parseInt(process.env.TOP_K_RESULTS || '4', 10),
  CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE || '700', 10),
  CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP || '150', 10),
  
  // Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10),
};

module.exports = config;