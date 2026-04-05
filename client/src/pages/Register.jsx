import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

export default function Register() {
  const { register } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return error("Passwords don't match");
    if (form.password.length < 6) return error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      if (data.success) { success('Account created! Welcome 🚀'); navigate('/dashboard'); }
      else error(data.message || 'Registration failed');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 shadow-2xl shadow-primary-900/40 mb-4">
            <span className="text-2xl font-display font-bold text-white">E</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Start Learning</h1>
          <p className="text-gray-400 mt-2 text-sm">Create your free account today</p>
        </div>

        <div className="glass-strong rounded-2xl p-8">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t('auth.name')}</label>
              <input name="name" required value={form.name} onChange={handle}
                placeholder="Your full name" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t('auth.email')}</label>
              <input name="email" type="email" required value={form.email} onChange={handle}
                placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">{t('auth.password')}</label>
              <input name="password" type="password" required value={form.password} onChange={handle}
                placeholder="Min 6 characters" className="input-field" />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthColors[strength]}`}
                      style={{ width: `${(strength / 3) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Confirm Password</label>
              <input name="confirm" type="password" required value={form.confirm} onChange={handle}
                placeholder="Repeat password" className="input-field" />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Account 🚀'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
