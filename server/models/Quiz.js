const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quizTitle: { type: String },
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number },
  weakTopics: [{ type: String }],
  aiAnalysis: { type: String },
  timeTaken: { type: Number }, // in seconds
  attemptNumber: { type: Number, default: 1 }
}, { timestamps: true });

quizResultSchema.pre('save', function(next) {
  this.percentage = Math.round((this.score / this.totalQuestions) * 100);
  next();
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
