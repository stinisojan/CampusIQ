const config = require('../config/env');
const FAQ = require('../models/FAQ');

const generateFAQsFromText = async (documentId, text, department = 'General', category = 'General') => {
  if (!text || text.trim().length < 200) return [];

  const prompt = `Extract 3 to 5 clear, representative Frequently Asked Questions (FAQs) and their authoritative answers from the following campus document text. Format the output strictly as a JSON array of objects with keys "question" and "answer". Do not include Markdown wrapping.

DOCUMENT TEXT:
${text.slice(0, 3500)}`;

  let faqArray = [];

  try {
    if (config.LLM_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL || 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
      faqArray = JSON.parse(cleanJson);
    } else if (config.OPENAI_API_KEY) {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: config.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      });
      const cleanJson = completion.choices[0].message.content.replace(/```json|```/g, '').trim();
      faqArray = JSON.parse(cleanJson);
    }

    if (Array.isArray(faqArray) && faqArray.length > 0) {
      await FAQ.deleteMany({ documentId });
      const records = faqArray.map((item) => ({
        documentId,
        question: item.question,
        answer: item.answer,
        department,
        category,
      }));
      return await FAQ.insertMany(records);
    }
  } catch (err) {
    console.warn('[FAQService] Error generating document FAQs:', err.message);
  }
  return [];
};

module.exports = { generateFAQsFromText };