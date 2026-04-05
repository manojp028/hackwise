const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, enrollCourse, getQuizWithAnswers } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/:id/enroll', protect, enrollCourse);
router.get('/:id/quiz/:quizId', protect, getQuizWithAnswers);

module.exports = router;
