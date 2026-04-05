const Progress = require('../models/Progress');
const User = require('../models/User');
const { updateStreak } = require('../utils/streakManager');

// @route POST /api/progress/update
const updateProgress = async (req, res, next) => {
  try {
    const { courseId, videoIndex, timeSpent } = req.body;

    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (!progress) {
      progress = new Progress({ user: req.user._id, course: courseId });
    }

    if (videoIndex !== undefined && !progress.completedVideos.includes(videoIndex)) {
      progress.completedVideos.push(videoIndex);
    }

    if (timeSpent) {
      progress.timeSpent += timeSpent;
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    // Update user's enrolled course progress
    await User.updateOne(
      { _id: req.user._id, 'enrolledCourses.course': courseId },
      { $set: { 'enrolledCourses.$.progress': progress.overallProgress } }
    );

    // Update streak
    await updateStreak(req.user._id);

    // Update weekly activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await User.updateOne(
      { _id: req.user._id, 'weeklyActivity.date': today },
      { $inc: { 'weeklyActivity.$.minutesSpent': timeSpent || 0, 'weeklyActivity.$.lessonsCompleted': videoIndex !== undefined ? 1 : 0 } }
    );

    const activityExists = await User.findOne({ _id: req.user._id, 'weeklyActivity.date': today });
    if (!activityExists) {
      await User.updateOne(
        { _id: req.user._id },
        { $push: { weeklyActivity: { date: today, minutesSpent: timeSpent || 0, lessonsCompleted: videoIndex !== undefined ? 1 : 0 } } }
      );
    }

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/progress/:userId
const getUserProgress = async (req, res, next) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    const progressList = await Progress.find({ user: userId })
      .populate('course', 'title thumbnail category videos quizzes');

    const user = await User.findById(userId).select('streak weeklyActivity points badges enrolledCourses');

    // Calculate overall stats
    const totalCourses = progressList.length;
    const completedCourses = progressList.filter(p => p.isCompleted).length;
    const avgProgress = totalCourses > 0
      ? Math.round(progressList.reduce((sum, p) => sum + p.overallProgress, 0) / totalCourses)
      : 0;

    // Build weekly activity for last 7 days
    const weeklyData = buildWeeklyData(user?.weeklyActivity || []);

    res.json({
      success: true,
      progressList,
      stats: {
        totalCourses,
        completedCourses,
        avgProgress,
        streak: user?.streak || { current: 0, longest: 0 },
        points: user?.points || 0,
        badges: user?.badges || [],
        weeklyData
      }
    });
  } catch (error) {
    next(error);
  }
};

const buildWeeklyData = (weeklyActivity) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const activity = weeklyActivity.find(a => {
      const actDate = new Date(a.date);
      actDate.setHours(0, 0, 0, 0);
      return actDate.getTime() === date.getTime();
    });

    result.push({
      day: days[date.getDay()],
      date: date.toISOString().split('T')[0],
      minutes: activity?.minutesSpent || 0,
      lessons: activity?.lessonsCompleted || 0
    });
  }

  return result;
};

module.exports = { updateProgress, getUserProgress };
