const express = require('express');
const router = express.Router();
const { updateProgress, getUserProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateProgress);
router.get('/:userId', protect, getUserProgress);

// Quiz submission route
const QuizResult = require('../models/Quiz');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { extractWeakTopics } = require('../utils/aiHelper');

router.post('/quiz/submit', protect, async (req, res, next) => {
  try {
    const { courseId, quizId, answers, timeTaken } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const quiz = course.quizzes.id(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Grade answers
    let score = 0;
    const gradedAnswers = quiz.questions.map((q, i) => {
      const correct = answers[i] === q.correctAnswer;
      if (correct) score++;
      return { questionIndex: i, userAnswer: answers[i], correctAnswer: q.correctAnswer, correct };
    });

    const weakTopics = extractWeakTopics(quiz.questions, answers);
    const percentage = Math.round((score / quiz.questions.length) * 100);

    // Save result
    const existingResult = await QuizResult.findOne({ user: req.user._id, course: courseId, quizId });
    let result;
    if (existingResult) {
      existingResult.score = score;
      existingResult.answers = answers;
      existingResult.percentage = percentage;
      existingResult.weakTopics = weakTopics;
      existingResult.timeTaken = timeTaken;
      existingResult.attemptNumber += 1;
      result = await existingResult.save();
    } else {
      result = await QuizResult.create({
        user: req.user._id,
        course: courseId,
        quizId,
        quizTitle: quiz.title,
        answers,
        score,
        totalQuestions: quiz.questions.length,
        weakTopics,
        timeTaken
      });
    }

    // Update progress
    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!progress) progress = new Progress({ user: req.user._id, course: courseId });

    const alreadyCompleted = progress.completedQuizzes.find(q => q.quizId.toString() === quizId);
    if (!alreadyCompleted) {
      progress.completedQuizzes.push({ quizId, score, totalQuestions: quiz.questions.length, weakTopics });
    } else {
      alreadyCompleted.score = score;
    }
    await progress.save();

    // Award points
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: Math.floor(percentage / 10) * 5 } });

    res.json({
      success: true,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      weakTopics,
      gradedAnswers,
      result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
