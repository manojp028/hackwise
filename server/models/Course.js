const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  duration: { type: String, default: '' },
  order: { type: Number, default: 0 },
  description: { type: String, default: '' }
});

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  topic: { type: String, default: '' },
  explanation: { type: String, default: '' }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 600 } // seconds
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['JEE', 'Physics', 'Math', 'Chemistry', 'Biology', 'English', 'Computer Science']
  },
  thumbnail: { type: String, default: '' },
  instructor: { type: String, required: true },
  duration: { type: String, default: '' },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  videos: [videoSchema],
  quizzes: [quizSchema],
  tags: [{ type: String }],
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  isPublished: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
