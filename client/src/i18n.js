import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: { dashboard: 'Dashboard', courses: 'Courses', challenge: 'Challenge', profile: 'Profile', logout: 'Logout' },
      dashboard: {
        welcome: 'Welcome back',
        streak: 'Day Streak',
        progress: 'Overall Progress',
        weeklyActivity: 'Weekly Activity',
        recommendedCourses: 'Recommended Courses',
        completedCourses: 'Courses Completed',
        totalPoints: 'Total Points',
        enrollNow: 'Enroll Now',
        continueLearn: 'Continue Learning',
      },
      courses: { explore: 'Explore Courses', all: 'All', enroll: 'Enroll', watchNow: 'Watch Now', level: 'Level', instructor: 'Instructor' },
      quiz: { startQuiz: 'Start Quiz', submit: 'Submit', next: 'Next', score: 'Your Score', weakTopics: 'Weak Topics', aiAnalysis: 'AI Analysis' },
      challenge: { findOpponent: 'Find Opponent', searching: 'Searching...', vs: 'VS', winner: 'Winner!', draw: 'Draw!', yourScore: 'Your Score', oppScore: "Opponent's Score" },
      common: { loading: 'Loading...', error: 'Something went wrong', retry: 'Retry', back: 'Back', save: 'Save', cancel: 'Cancel' },
      auth: { login: 'Login', register: 'Register', email: 'Email', password: 'Password', name: 'Full Name', haveAccount: 'Already have an account?', noAccount: "Don't have an account?" }
    }
  },
  hi: {
    translation: {
      nav: { dashboard: 'डैशबोर्ड', courses: 'कोर्स', challenge: 'चुनौती', profile: 'प्रोफाइल', logout: 'लॉगआउट' },
      dashboard: {
        welcome: 'वापस स्वागत है',
        streak: 'दिन की लकीर',
        progress: 'कुल प्रगति',
        weeklyActivity: 'साप्ताहिक गतिविधि',
        recommendedCourses: 'अनुशंसित कोर्स',
        completedCourses: 'पूर्ण कोर्स',
        totalPoints: 'कुल अंक',
        enrollNow: 'अभी नामांकन करें',
        continueLearn: 'सीखना जारी रखें',
      },
      courses: { explore: 'कोर्स खोजें', all: 'सभी', enroll: 'नामांकन', watchNow: 'अभी देखें', level: 'स्तर', instructor: 'शिक्षक' },
      quiz: { startQuiz: 'क्विज़ शुरू करें', submit: 'जमा करें', next: 'अगला', score: 'आपका स्कोर', weakTopics: 'कमजोर विषय', aiAnalysis: 'AI विश्लेषण' },
      challenge: { findOpponent: 'प्रतिद्वंद्वी खोजें', searching: 'खोज रहे हैं...', vs: 'बनाम', winner: 'विजेता!', draw: 'ड्रा!', yourScore: 'आपका स्कोर', oppScore: 'प्रतिद्वंद्वी का स्कोर' },
      common: { loading: 'लोड हो रहा है...', error: 'कुछ गलत हुआ', retry: 'पुनः प्रयास', back: 'वापस', save: 'सहेजें', cancel: 'रद्द करें' },
      auth: { login: 'लॉगिन', register: 'रजिस्टर', email: 'ईमेल', password: 'पासवर्ड', name: 'पूरा नाम', haveAccount: 'पहले से खाता है?', noAccount: 'खाता नहीं है?' }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
