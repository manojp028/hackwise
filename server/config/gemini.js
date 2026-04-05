const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGeminiClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not set. AI features will use fallback mode.');
      return null;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const getGeminiModel = () => {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

module.exports = { getGeminiClient, getGeminiModel };
