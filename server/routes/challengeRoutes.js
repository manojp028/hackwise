const express = require('express');
const router = express.Router();
const { startChallenge, joinChallenge, getActiveChallenges, getChallengeHistory } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startChallenge);
router.post('/join/:roomId', protect, joinChallenge);
router.get('/active', protect, getActiveChallenges);
router.get('/history', protect, getChallengeHistory);

module.exports = router;
