const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elearning', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed initial data if empty
    await seedInitialData();
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const seedInitialData = async () => {
  const Course = require('../models/Course');
  const count = await Course.countDocuments();
  if (count === 0) {
    const sampleCourses = [
      {
        title: 'Complete JEE Mathematics',
        description: 'Master JEE Mathematics with comprehensive video lectures, quizzes, and practice problems covering all major topics.',
        category: 'JEE',
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
        instructor: 'Dr. Rajesh Kumar',
        duration: '120 hours',
        level: 'Advanced',
        videos: [
          { title: 'Introduction to Calculus', url: 'https://www.youtube.com/embed/WUvTyaaNkzM', duration: '45 min', order: 1 },
          { title: 'Differential Equations', url: 'https://www.youtube.com/embed/p_di4Zn4wz4', duration: '52 min', order: 2 },
          { title: 'Integration Techniques', url: 'https://www.youtube.com/embed/rfG8ce4nNh0', duration: '48 min', order: 3 },
        ],
        quizzes: [
          {
            title: 'Calculus Fundamentals Quiz',
            questions: [
              { question: 'What is the derivative of x²?', options: ['x', '2x', '2x²', 'x/2'], correctAnswer: 1, topic: 'Calculus' },
              { question: 'What is ∫2x dx?', options: ['x²', 'x² + C', '2x²', '2x² + C'], correctAnswer: 1, topic: 'Integration' },
              { question: 'What is the limit of sin(x)/x as x→0?', options: ['0', '∞', '1', '-1'], correctAnswer: 2, topic: 'Limits' },
              { question: 'What is d/dx(eˣ)?', options: ['eˣ⁻¹', 'eˣ', 'xeˣ', 'e'], correctAnswer: 1, topic: 'Calculus' },
            ]
          }
        ],
        tags: ['mathematics', 'jee', 'calculus', 'algebra'],
        enrolledCount: 1240,
        rating: 4.8
      },
      {
        title: 'Physics: Mechanics & Waves',
        description: 'Deep dive into classical mechanics, waves, and oscillations. Perfect for JEE, NEET, and board exams.',
        category: 'Physics',
        thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
        instructor: 'Prof. Anita Singh',
        duration: '85 hours',
        level: 'Intermediate',
        videos: [
          { title: "Newton's Laws of Motion", url: 'https://www.youtube.com/embed/kKKM8Y-u7ds', duration: '40 min', order: 1 },
          { title: 'Work, Energy, Power', url: 'https://www.youtube.com/embed/w4QFJb9a8vo', duration: '55 min', order: 2 },
          { title: 'Wave Motion', url: 'https://www.youtube.com/embed/5v5eBf2KwF8', duration: '50 min', order: 3 },
        ],
        quizzes: [
          {
            title: 'Mechanics Quiz',
            questions: [
              { question: 'A body of mass 5 kg is acted upon by a net force of 20 N. What is its acceleration?', options: ['2 m/s²', '4 m/s²', '100 m/s²', '0.25 m/s²'], correctAnswer: 1, topic: 'Newton\'s Laws' },
              { question: 'Which law states F = ma?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctAnswer: 1, topic: 'Newton\'s Laws' },
              { question: 'What is kinetic energy formula?', options: ['mgh', '½mv²', 'mv²', '2mv²'], correctAnswer: 1, topic: 'Energy' },
              { question: 'Unit of power is?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 2, topic: 'Power' },
            ]
          }
        ],
        tags: ['physics', 'mechanics', 'waves', 'jee'],
        enrolledCount: 980,
        rating: 4.7
      },
      {
        title: 'Organic Chemistry Mastery',
        description: 'Complete organic chemistry course covering reactions, mechanisms, and named reactions for competitive exams.',
        category: 'Chemistry',
        thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
        instructor: 'Dr. Meena Patel',
        duration: '95 hours',
        level: 'Intermediate',
        videos: [
          { title: 'Hydrocarbons Introduction', url: 'https://www.youtube.com/embed/LFhFJKOEsBg', duration: '42 min', order: 1 },
          { title: 'Alkyl Halides & Reactions', url: 'https://www.youtube.com/embed/kGYKR4TMeI4', duration: '58 min', order: 2 },
          { title: 'Aromatic Compounds', url: 'https://www.youtube.com/embed/9kGVNpGRWp0', duration: '47 min', order: 3 },
        ],
        quizzes: [
          {
            title: 'Organic Chemistry Basics',
            questions: [
              { question: 'What type of bond is C-C?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctAnswer: 1, topic: 'Bonding' },
              { question: 'Benzene formula is?', options: ['C6H12', 'C6H6', 'C6H14', 'C5H6'], correctAnswer: 1, topic: 'Aromatic Compounds' },
              { question: 'Which is an alkane?', options: ['C2H4', 'C2H2', 'C2H6', 'C2H6O'], correctAnswer: 2, topic: 'Hydrocarbons' },
              { question: 'What is the functional group of alcohols?', options: ['-COOH', '-CHO', '-OH', '-NH2'], correctAnswer: 2, topic: 'Functional Groups' },
            ]
          }
        ],
        tags: ['chemistry', 'organic', 'reactions', 'jee'],
        enrolledCount: 756,
        rating: 4.6
      },
      {
        title: 'Advanced Mathematics: Algebra',
        description: 'Master algebra from basics to advanced level. Covers polynomials, matrices, and complex numbers.',
        category: 'Math',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
        instructor: 'Prof. Vikram Sharma',
        duration: '70 hours',
        level: 'Beginner',
        videos: [
          { title: 'Quadratic Equations', url: 'https://www.youtube.com/embed/2ZzuZvz33X0', duration: '38 min', order: 1 },
          { title: 'Matrix Operations', url: 'https://www.youtube.com/embed/rowWM-MijXU', duration: '52 min', order: 2 },
          { title: 'Complex Numbers', url: 'https://www.youtube.com/embed/5PcpBw5Hbwo', duration: '44 min', order: 3 },
        ],
        quizzes: [
          {
            title: 'Algebra Fundamentals',
            questions: [
              { question: 'What are the roots of x² - 5x + 6 = 0?', options: ['2, 3', '1, 6', '-2, -3', '2, -3'], correctAnswer: 0, topic: 'Quadratic Equations' },
              { question: 'What is i² (imaginary unit)?', options: ['1', '-1', 'i', '0'], correctAnswer: 1, topic: 'Complex Numbers' },
              { question: 'What is the determinant of [[1,2],[3,4]]?', options: ['10', '-2', '2', '-10'], correctAnswer: 1, topic: 'Matrices' },
              { question: 'Solve: 2x + 4 = 12', options: ['x = 4', 'x = 8', 'x = 3', 'x = 6'], correctAnswer: 0, topic: 'Linear Equations' },
            ]
          }
        ],
        tags: ['math', 'algebra', 'matrices', 'complex numbers'],
        enrolledCount: 1100,
        rating: 4.9
      }
    ];

    await Course.insertMany(sampleCourses);
    console.log('✅ Sample courses seeded');
  }
};

module.exports = connectDB;
