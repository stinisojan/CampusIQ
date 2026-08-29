const config = require('../config/env');
const { generateEmbedding } = require('../services/embeddingService');
const { getVectorStore } = require('../config/vectorStore');
const Chunk = require('../models/Chunk');

/**
 * Reciprocal Rank Fusion (RRF) Scorer
 */
const computeRRFScore = (vectorRank, keywordRank, k = 60) => {
  const vScore = vectorRank !== -1 ? 1 / (k + vectorRank) : 0;
  const kScore = keywordRank !== -1 ? 1 / (k + keywordRank) : 0;
  return vScore + kScore;
};

/**
 * Cross-Encoder Chunk Re-ranker
 */
const rerankChunks = async (queryText, candidateChunks) => {
  if (candidateChunks.length <= 2 || (!config.GEMINI_API_KEY && !config.OPENAI_API_KEY)) {
    return candidateChunks;
  }

  const prompt = `You are a Cross-Encoder Re-ranker. Rank the candidate document chunks based on their direct relevance to answering the student query: "${queryText}".
Return JSON array of objects with keys "chunkIndex" (0-based index from candidate list) and "relevanceScore" (float between 0.0 and 1.0).

CANDIDATES:
${candidateChunks.map((c, i) => `[Index ${i}] ${c.text.slice(0, 200)}...`).join('\n')}`;

  try {
    if (config.LLM_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      
      // Sanitize model string: strip any leading 'models/' prefix
      const rawModel = config.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      const cleanModel = rawModel.replace(/^models\//, '');

      const model = genAI.getGenerativeModel({ model: cleanModel });
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
      const rankings = JSON.parse(cleanJson);

      const ranked = candidateChunks.map((chunk, idx) => {
        const item = rankings.find((r) => r.chunkIndex === idx);
        return {
          ...chunk,
          rerankScore: item ? item.relevanceScore : chunk.score,
        };
      });

      ranked.sort((a, b) => b.rerankScore - a.rerankScore);
      return ranked;
    }
  } catch (err) {
    console.warn('[RetrieverAgent] Cross-encoder re-ranking warning:', err.message);
  }

  return candidateChunks;
};

/**
 * Hybrid retrieval combining dense vector similarity with sparse keyword match scores
 */
const retrieveRelevantChunks = async (queryText, options = {}) => {
  const topK = options.topK || config.TOP_K_RESULTS || 4;
  const minScore = options.minScore !== undefined ? options.minScore : config.SIMILARITY_THRESHOLD;
  const department = options.department;

  // 1. Dense Vector Search
  const queryEmbedding = await generateEmbedding(queryText);
  const vectorStore = getVectorStore();
  const filter = {};
  if (department && department !== 'General' && department !== 'All') {
    filter.department = department;
  }
  const rawVectorResults = (await vectorStore.query(queryEmbedding, 10, filter)) || [];

  // 2. Sparse Keyword Search (Mongo Chunk Text Search / Regex)
  const keywords = queryText.split(/\s+/).filter((w) => w.length > 3);
  const keywordQuery = {};
  if (department && department !== 'General' && department !== 'All') {
    keywordQuery.department = department;
  }

  let keywordChunks = [];
  try {
    const regexQuery = keywords.map((k) => new RegExp(k, 'i'));
    keywordChunks = await Chunk.find({ ...keywordQuery, text: { $in: regexQuery } }).limit(10).lean();
  } catch (e) {
    keywordChunks = [];
  }

  // 3. Reciprocal Rank Fusion (RRF) Integration
  const candidateMap = new Map();

  rawVectorResults.forEach((res, rank) => {
    candidateMap.set(res.vectorId, {
      chunkId: res.vectorId,
      score: res.score,
      text: res.metadata.text,
      metadata: res.metadata,
      vectorRank: rank + 1,
      keywordRank: -1,
    });
  });

  keywordChunks.forEach((chunk, rank) => {
    const vId = chunk.vectorId || String(chunk._id);
    if (candidateMap.has(vId)) {
      candidateMap.get(vId).keywordRank = rank + 1;
    } else {
      candidateMap.set(vId, {
        chunkId: vId,
        score: 0.5,
        text: chunk.text,
        metadata: {
          documentId: String(chunk.documentId),
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          page: chunk.page,
          section: chunk.section,
          department: chunk.department,
          filename: chunk.filename,
        },
        vectorRank: -1,
        keywordRank: rank + 1,
      });
    }
  });

  const fusedCandidates = Array.from(candidateMap.values()).map((cand) => ({
    ...cand,
    rrfScore: computeRRFScore(cand.vectorRank, cand.keywordRank),
  }));

  fusedCandidates.sort((a, b) => b.rrfScore - a.rrfScore);
  const topCandidates = fusedCandidates.slice(0, 8);

  // 4. Cross-Encoder Re-ranking
  const rerankedChunks = await rerankChunks(queryText, topCandidates);
  const filteredChunks = rerankedChunks.filter((res) => res.score >= minScore).slice(0, topK);

  const topScore = filteredChunks[0]?.score || 0;

  return {
    chunks: filteredChunks,
    topScore: parseFloat(topScore.toFixed(4)),
    queryEmbedding,
  };
};

module.exports = { retrieveRelevantChunks };