const config = require('../config/env');

const generateEmbedding = async (text) => {
  const cleanText = text.replace(/\n/g, ' ').trim();
  if (!cleanText) return new Array(768).fill(0);

  // 1. Google Gemini Embeddings
  if (config.EMBEDDING_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      
      // Use config model name and format namespace safely
      const rawModel = config.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
      const modelName = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`;
      
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.embedContent(cleanText);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    } catch (err) {
      console.warn(`[EmbeddingService] Gemini embedding failed (${err.message}). Using local fallback vector.`);
    }
  }

  // 2. Local Fallback Vector Generator
  return generateDeterministicEmbedding(cleanText, 768);
};

function generateDeterministicEmbedding(text, dimension = 768) {
  const vector = new Array(dimension).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % dimension;
    vector[index] += 1 / (i + 1);
  }

  let norm = 0;
  for (let i = 0; i < dimension; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimension; i++) {
      vector[i] /= norm;
    }
  }
  return vector;
}

const generateBatchEmbeddings = async (texts) => {
  const results = [];
  for (let i = 0; i < texts.length; i++) {
    const emb = await generateEmbedding(texts[i]);
    results.push(emb);
    if (i < texts.length - 1 && config.GEMINI_API_KEY) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  }
  return results;
};

module.exports = {
  generateEmbedding,
  generateBatchEmbeddings,
};