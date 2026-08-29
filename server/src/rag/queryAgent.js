const config = require('../config/env');

/**
 * Normalizes/rewrites the user question, resolving references using prior chat turns
 * @param {string} currentQuestion - Latest user query
 * @param {Array<{ role: string, content: string }>} conversationHistory - Previous turns
 * @returns {Promise<string>} Standalone contextual search query
 */
const rewriteQueryWithHistory = async (currentQuestion, conversationHistory = []) => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return currentQuestion.trim();
  }

  // Take the last 4 turns for context
  const recentHistory = conversationHistory.slice(-4);
  const isFollowUp = recentHistory.length > 0 && /^(it|its|they|them|these|this|that|he|she|what about|how about|and|why|where|when|cost|eligibility)\b/i.test(currentQuestion.trim());

  if (!isFollowUp) {
    return currentQuestion.trim();
  }

  // Attempt rewriting using LLM if available
  if (config.GEMINI_API_KEY && config.LLM_PROVIDER === 'gemini') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL || 'gemini-1.5-flash' });

      const prompt = `You are a query reformulation assistant for a college information chatbot.
Given the chat history and the user's latest follow-up question, rewrite the question into a clear, self-contained standalone search query that includes all necessary context and college terminology.
DO NOT answer the question. Only output the rewritten question.

Chat History:
${recentHistory.map((m) => `${m.role}: ${m.content}`).join('\n')}

User Follow-Up: ${currentQuestion}

Standalone Search Query:`;

      const result = await model.generateContent(prompt);
      const rewritten = result.response.text().trim();
      return rewritten || currentQuestion;
    } catch (err) {
      console.warn('[QueryAgent] Gemini query rewrite error, using raw query:', err.message);
    }
  }

  if (config.OPENAI_API_KEY && config.LLM_PROVIDER === 'openai') {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: config.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Rewrite the follow-up question into a standalone college search query using the provided conversation history. Only return the query.',
          },
          ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: currentQuestion },
        ],
        temperature: 0.2,
      });

      return completion.choices[0].message.content.trim() || currentQuestion;
    } catch (err) {
      console.warn('[QueryAgent] OpenAI query rewrite error, using raw query:', err.message);
    }
  }

  return currentQuestion.trim();
};

module.exports = { rewriteQueryWithHistory };
