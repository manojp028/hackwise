const express = require('express');
const router = express.Router();
const { analyzeQuizResults, getRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeQuizResults);
router.post('/recommend', protect, getRecommendations);

module.exports = router;
