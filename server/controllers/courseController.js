const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

// @route GET /api/courses
const getCourses = async (req, res, next) => {
  try {
    const { category, search, level, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') query.category = category;
    if (level) query.level = level;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .select('-quizzes.questions.correctAnswer')
      .sort({ enrolledCount: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      courses,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/courses/:id
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Don't expose correct answers in course listing
    const courseObj = course.toObject();
    courseObj.quizzes = courseObj.quizzes.map(q => ({
      ...q,
      questions: q.questions.map(({ correctAnswer, ...rest }) => rest)
    }));

    res.json({ success: true, course: courseObj });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/courses/:id/enroll
const enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const user = await User.findById(req.user._id);
    const alreadyEnrolled = user.enrolledCourses.some(e => e.course.toString() === req.params.id);

    if (!alreadyEnrolled) {
      user.enrolledCourses.push({ course: req.params.id });
      await user.save();
      await Course.findByIdAndUpdate(req.params.id, { $inc: { enrolledCount: 1 } });

      // Create progress record
      await Progress.create({ user: req.user._id, course: req.params.id });
    }

    res.json({ success: true, message: alreadyEnrolled ? 'Already enrolled' : 'Enrolled successfully' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/courses/:id/quiz/:quizId
const getQuizWithAnswers = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const quiz = course.quizzes.id(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    res.json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourseById, enrollCourse, getQuizWithAnswers };
