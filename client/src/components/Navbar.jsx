import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { path: '/challenge', label: t('nav.challenge'), icon: '⚔️' },
    { path: '/profile', label: t('nav.profile'), icon: '👤' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleLang = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-primary-900/40 group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-display font-bold text-lg text-white hidden sm:block">EduLearn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${location.pathname === link.path
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-all border border-white/5"
            >
              🌐 {i18n.language === 'en' ? 'EN' : 'HI'}
            </button>

            {/* Streak badge */}
            {user?.streak?.current > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="fire-pulse">🔥</span>
                <span className="text-xs font-bold text-orange-400">{user.streak.current}</span>
              </div>
            )}

            {/* Points */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <span>⚡</span>
                <span className="text-xs font-bold text-yellow-400">{user.points || 0}</span>
              </div>
            )}

            {/* Avatar / Profile */}
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-md group-hover:scale-105 transition-transform">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
            >
              🚪
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1 animate-fade-in">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${location.pathname === link.path ? 'bg-primary-600/20 text-primary-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 mt-2">
              <button onClick={toggleLang} className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-gray-400 text-sm">
                🌐 {i18n.language === 'en' ? 'Switch to हिंदी' : 'Switch to English'}
              </button>
              <button onClick={handleLogout} className="flex-1 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm">
                🚪 Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
