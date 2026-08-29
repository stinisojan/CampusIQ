const config = require('../config/env');

const NOT_FOUND_MESSAGE =
  "I don't have information on that in the current campus knowledge base. Please contact the college administration office or refer to official department notices.";

const SYSTEM_PROMPT = `You are CampusIQ, the official AI College Information Assistant.
Your mission is to provide accurate, helpful, and concise answers to students, faculty, and visitors.

STRICT GROUNDING RULES:
1. Ground your answer ONLY in the provided SOURCE DOCUMENTS context below.
2. If the context does not contain enough information to answer the question accurately, politely state:
   "${NOT_FOUND_MESSAGE}"
3. DO NOT invent, extrapolate, or hallucinate policies, dates, fees, or contact details not present in the context.
4. Format your response using clean Markdown (bullet points, bold text for key dates/deadlines, structured paragraphs).
5. When referencing facts, naturally mention the relevant document, page, or section (e.g. "(as stated in Hostel Regulations, Sec 2)").
6. Maintain a supportive, respectful, and professional collegiate tone.`;

/**
 * Generates an answer from context, optionally streaming tokens
 * @param {string} question - User question
 * @param {string} contextText - Formatted context from source documents
 * @param {boolean} hasContext - Whether sufficient context was retrieved
 * @param {Function} [onToken] - Optional callback for streaming tokens
 * @returns {Promise<{ answer: string, wasAnswered: boolean, provider: string }>}
 */
const generateAnswer = async (question, contextText, hasContext, onToken = null) => {
  // Safe Fallback when no context matches the threshold
  if (!hasContext || !contextText || contextText.trim().length === 0) {
    if (onToken) {
      onToken(NOT_FOUND_MESSAGE);
    }
    return {
      answer: NOT_FOUND_MESSAGE,
      wasAnswered: false,
      provider: 'fallback',
    };
  }

  // 1. Google Gemini Provider
  if (config.LLM_PROVIDER === 'gemini' && config.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
      
      // Sanitize model string: strip any leading 'models/' prefix
      const rawModel = config.GEMINI_MODEL || 'gemini-3.5-flash-lite';
      const cleanModel = rawModel.replace(/^models\//, '');

      const model = genAI.getGenerativeModel({
        model: cleanModel,
        systemInstruction: SYSTEM_PROMPT,
      });

      const userPrompt = `CONTEXT FROM CAMPUS DOCUMENTS:\n${contextText}\n\nSTUDENT QUESTION:\n${question}\n\nANSWER:`;

      if (onToken) {
        const streamResult = await model.generateContentStream(userPrompt);
        let fullAnswer = '';

        for await (const chunk of streamResult.stream) {
          const chunkText = chunk.text();
          fullAnswer += chunkText;
          onToken(chunkText);
        }

        const cleanAnswer = fullAnswer.trim() || NOT_FOUND_MESSAGE;
        const wasAnswered = !cleanAnswer.includes(NOT_FOUND_MESSAGE);

        return {
          answer: cleanAnswer,
          wasAnswered,
          provider: 'gemini',
        };
      } else {
        const result = await model.generateContent(userPrompt);
        const text = result.response.text().trim();
        const wasAnswered = !text.includes(NOT_FOUND_MESSAGE);

        return {
          answer: text || NOT_FOUND_MESSAGE,
          wasAnswered,
          provider: 'gemini',
        };
      }
    } catch (err) {
      console.error('[AnswerAgent] Gemini generation error:', err.message);
      if (config.OPENAI_API_KEY) {
        return generateOpenAIAnswer(question, contextText, onToken);
      }
      throw err;
    }
  }

  // 2. OpenAI Provider
  if (config.LLM_PROVIDER === 'openai' || config.OPENAI_API_KEY) {
    return generateOpenAIAnswer(question, contextText, onToken);
  }

  // 3. Fallback when no LLM API key provided
  console.warn('[AnswerAgent] No LLM API Key provided. Extracting clean excerpt for demo.');

  const cleanExcerpt = contextText
    .replace(/--- \[SOURCE DOCUMENT \d+:.*?\n/g, '')
    .replace(/^=+\n/gm, '')
    .trim();

  const mockAnswer = `Here is the relevant information found in the official campus documents:\n\n> ${cleanExcerpt.slice(0, 450).trim()}...\n\n*(💡 **Note:** Add \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` to your \`.env\` file to enable live AI synthesis and full streaming answers!)*`;

  if (onToken) onToken(mockAnswer);

  return {
    answer: mockAnswer,
    wasAnswered: true,
    provider: 'demo-local',
  };
};

const generateOpenAIAnswer = async (question, contextText, onToken) => {
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `CONTEXT FROM CAMPUS DOCUMENTS:\n${contextText}\n\nSTUDENT QUESTION:\n${question}\n\nANSWER:`,
    },
  ];

  if (onToken) {
    const stream = await openai.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.2,
    });

    let fullAnswer = '';
    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content || '';
      if (token) {
        fullAnswer += token;
        onToken(token);
      }
    }

    const cleanAnswer = fullAnswer.trim() || NOT_FOUND_MESSAGE;
    return {
      answer: cleanAnswer,
      wasAnswered: !cleanAnswer.includes(NOT_FOUND_MESSAGE),
      provider: 'openai',
    };
  } else {
    const response = await openai.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.2,
    });

    const answer = response.choices[0].message.content.trim();
    return {
      answer: answer || NOT_FOUND_MESSAGE,
      wasAnswered: !answer.includes(NOT_FOUND_MESSAGE),
      provider: 'openai',
    };
  }
};

module.exports = {
  generateAnswer,
  NOT_FOUND_MESSAGE,
};