const { getGeminiModel } = require('../config/gemini');
const QuizResult = require('../models/Quiz');
const { generateFallbackAnalysis } = require('../utils/aiHelper');

// @route POST /api/ai/analyze
const analyzeQuizResults = async (req, res, next) => {
  try {
    const { quizResults, courseTitle, score, totalQuestions, weakTopics } = req.body;

    const model = getGeminiModel();
    let analysis;

    if (!model) {
      // Fallback if no API key
      analysis = generateFallbackAnalysis(score, totalQuestions, weakTopics, courseTitle);
    } else {
      const prompt = `
You are an expert educational AI tutor. Analyze the following quiz performance and provide personalized learning recommendations.

Course: ${courseTitle || 'General'}
Score: ${score} out of ${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)
Weak Topics Identified: ${weakTopics?.join(', ') || 'None specified'}
Question Results: ${JSON.stringify(quizResults || [])}

Please provide:
1. A brief performance summary (2-3 sentences)
2. Specific weak areas and why they need attention
3. 3-4 concrete, actionable study recommendations
4. Motivational message
5. Estimated time to improve (e.g., "2-3 hours of focused practice")

Keep the response concise, encouraging, and focused on actionable steps. Format it clearly but without using markdown headers - use plain text with numbered points.
      `;

      try {
        const result = await model.generateContent(prompt);
        analysis = result.response.text();
      } catch (aiError) {
        console.error('Gemini API error:', aiError.message);
        analysis = generateFallbackAnalysis(score, totalQuestions, weakTopics, courseTitle);
      }
    }

    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/ai/recommend
const getRecommendations = async (req, res, next) => {
  try {
    const { completedCourses, interests, weakTopics } = req.body;
    const model = getGeminiModel();

    let recommendations;
    if (!model) {
      recommendations = 'Based on your progress, we recommend continuing with practice problems in your weak areas and exploring related topics to build a stronger foundation.';
    } else {
      const prompt = `As an educational advisor, suggest 3 specific study topics or resources for a student who has completed: ${completedCourses?.join(', ')} and is weak in: ${weakTopics?.join(', ')}. Keep it brief and actionable.`;
      try {
        const result = await model.generateContent(prompt);
        recommendations = result.response.text();
      } catch (aiError) {
        recommendations = 'Focus on reviewing your weak topics with practice problems. Consider watching video explanations and attempting similar questions.';
      }
    }

    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeQuizResults, getRecommendations };
