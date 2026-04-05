import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { login } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) { success('Welcome back! 🎉'); navigate('/dashboard'); }
      else error(data.message || 'Login failed');
    } catch (err) {
      error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 shadow-2xl shadow-primary-900/40 mb-4">
            <span className="text-2xl font-display font-bold text-white">E</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2 text-sm">Continue your learning journey</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t('auth.email')}</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handle}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t('auth.password')}</label>
              <input
                name="password" type="password" required
                value={form.password} onChange={handle}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Logging in...</>
              ) : t('auth.login')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                {t('auth.register')}
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5">
            <p className="text-xs text-gray-600 text-center mb-2">Demo Account</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ email: 'demo@edulearn.com', password: 'demo123' })}
                className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
              >
                Fill Demo Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
