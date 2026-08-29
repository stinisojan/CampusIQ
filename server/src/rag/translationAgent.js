const config = require('../config/env');

const detectAndTranslateQuery = async (queryText) => {
  if (!config.GEMINI_API_KEY && !config.OPENAI_API_KEY) {
    return { translatedQuery: queryText, detectedLanguage: 'en' };
  }

  const prompt = `Analyze the language of this student query. If it is in English, return JSON: {"language": "en", "translated": "${queryText}"}. If it is in another language, translate it to clear English and return JSON: {"language": "<detected_lang_code>", "translated": "<english_translation>"}. Return raw JSON only.

Query: "${queryText}"`;

  try {
    if (config.LLM_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL || 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { translatedQuery: parsed.translated || queryText, detectedLanguage: parsed.language || 'en' };
    }
  } catch (err) {
    console.warn('[TranslationAgent] Detection warning:', err.message);
  }

  return { translatedQuery: queryText, detectedLanguage: 'en' };
};

const translateAnswerToLanguage = async (answerText, targetLanguage) => {
  if (!targetLanguage || targetLanguage === 'en') return answerText;

  const prompt = `Translate the following collegiate information response accurately into language code "${targetLanguage}". Retain Markdown formatting, bullet points, and source citations.

Response to translate:
${answerText}`;

  try {
    if (config.LLM_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL || 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }
  } catch (err) {
    console.warn('[TranslationAgent] Translation back warning:', err.message);
  }

  return answerText;
};

module.exports = { detectAndTranslateQuery, translateAnswerToLanguage };