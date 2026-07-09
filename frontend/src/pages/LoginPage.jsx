import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';
import { HeartIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
      login(data.token, data.user, form.rememberMe);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center shadow-md">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              CuraBreast <span className="text-rose-500">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your health dashboard</p>
        </div>

        <div className="card shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-rose-600 font-semibold hover:text-rose-700">
                Create one free
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-semibold mb-1">Demo Credentials</p>
            <p className="text-xs text-blue-500">User: priya@example.com / User@1234</p>
            <p className="text-xs text-blue-500">Admin: admin@curabreast.ai / Admin@123</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Protected by end-to-end encryption. Your data is private.
        </p>
      </div>
    </div>
  );
}
