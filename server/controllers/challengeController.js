const Challenge = require('../models/Challenge');
const Course = require('../models/Course');
const User = require('../models/User');
const { v4: uuidv4 } = require ? require('crypto').randomUUID : () => Math.random().toString(36).slice(2);
const crypto = require('crypto');

// Get random questions for challenge
const getRandomQuestions = async (category) => {
  const query = { isPublished: true };
  if (category && category !== 'Mixed') query.category = category;

  const courses = await Course.find(query);
  const allQuestions = [];

  courses.forEach(course => {
    course.quizzes.forEach(quiz => {
      quiz.questions.forEach(q => {
        allQuestions.push({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          topic: q.topic || course.category
        });
      });
    });
  });

  // Shuffle and pick 10
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(10, shuffled.length));
};

// @route POST /api/challenge/start
const startChallenge = async (req, res, next) => {
  try {
    const { category } = req.body;
    const roomId = crypto.randomBytes(6).toString('hex');

    const questions = await getRandomQuestions(category);
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions available for this category' });
    }

    const challenge = await Challenge.create({
      roomId,
      players: [{
        user: req.user._id,
        name: req.user.name,
        score: 0,
        isReady: false
      }],
      questions,
      category: category || 'Mixed',
      status: 'waiting'
    });

    res.json({ success: true, challenge, roomId });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/challenge/join/:roomId
const joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findOne({ roomId: req.params.roomId, status: 'waiting' });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Room not found or already started' });
    }

    const alreadyIn = challenge.players.some(p => p.user.toString() === req.user._id.toString());
    if (!alreadyIn) {
      if (challenge.players.length >= 2) {
        return res.status(400).json({ success: false, message: 'Room is full' });
      }
      challenge.players.push({ user: req.user._id, name: req.user.name, score: 0 });
      await challenge.save();
    }

    res.json({ success: true, challenge });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/challenge/active
const getActiveChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ status: 'waiting' })
      .select('roomId players category createdAt')
      .populate('players.user', 'name avatar')
      .limit(10);

    res.json({ success: true, challenges });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/challenge/history
const getChallengeHistory = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({
      'players.user': req.user._id,
      status: 'completed'
    })
      .populate('winner', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, challenges });
  } catch (error) {
    next(error);
  }
};

module.exports = { startChallenge, joinChallenge, getActiveChallenges, getChallengeHistory };
