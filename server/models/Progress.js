const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedVideos: [{ type: Number }], // array of video order indices
  completedQuizzes: [{
    quizId: { type: mongoose.Schema.Types.ObjectId },
    score: { type: Number },
    totalQuestions: { type: Number },
    completedAt: { type: Date, default: Date.now },
    answers: [{ type: Number }],
    weakTopics: [{ type: String }]
  }],
  overallProgress: { type: Number, default: 0, min: 0, max: 100 },
  lastAccessedAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, default: 0 }, // in minutes
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { timestamps: true });

progressSchema.index({ user: 1, course: 1 }, { unique: true });

// Auto-calculate overall progress before saving
progressSchema.pre('save', async function(next) {
  const Course = require('./Course');
  try {
    const course = await Course.findById(this.course);
    if (course) {
      const totalItems = course.videos.length + course.quizzes.length;
      if (totalItems === 0) {
        this.overallProgress = 0;
      } else {
        const completedItems = this.completedVideos.length + this.completedQuizzes.length;
        this.overallProgress = Math.round((completedItems / totalItems) * 100);
      }
      if (this.overallProgress >= 100) {
        this.isCompleted = true;
        if (!this.completedAt) this.completedAt = new Date();
      }
    }
  } catch (err) {
    console.error('Progress calc error:', err);
  }
  next();
});

module.exports = mongoose.model('Progress', progressSchema);
