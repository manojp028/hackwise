export const CATEGORIES = ['All', 'JEE', 'Physics', 'Math', 'Chemistry', 'Biology', 'Computer Science'];

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const CATEGORY_COLORS = {
  JEE: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Physics: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Math: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Chemistry: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Biology: 'bg-green-500/20 text-green-300 border-green-500/30',
  'Computer Science': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

export const CATEGORY_ICONS = {
  JEE: '🎯',
  Physics: '⚛️',
  Math: '📐',
  Chemistry: '🧪',
  Biology: '🧬',
  'Computer Science': '💻',
};

export const LEVEL_COLORS = {
  Beginner: 'bg-emerald-500/20 text-emerald-300',
  Intermediate: 'bg-amber-500/20 text-amber-300',
  Advanced: 'bg-red-500/20 text-red-300',
};


export const API_BASE = import.meta.env.VITE_API_URL;
export const SOCKET_URL = window.location.origin;
