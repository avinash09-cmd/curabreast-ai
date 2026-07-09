import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';
import { HeartIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: '', email: '', phone: '', age: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { score: 0, label: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-400'];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center shadow-md">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              CuraBreast <span className="text-rose-500">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Start your breast health journey today</p>
        </div>

        <div className="card shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" className="input-field" placeholder="Priya Sharma" value={form.fullname} onChange={update('fullname')} required minLength={2} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={update('email')} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input type="tel" className="input-field" placeholder="+91-9876543210" value={form.phone} onChange={update('phone')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age <span className="text-red-500">*</span></label>
                <input type="number" className="input-field" placeholder="32" min="18" max="120" value={form.age} onChange={update('age')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={update('password')}
                  required minLength={8}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200'} transition-all`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strength.label} password</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  className={`input-field pr-10 ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 focus:ring-red-400' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  required
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-rose-600 font-semibold hover:text-rose-700">Sign in</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By creating an account, you agree to our Privacy Policy and Terms of Service.
        </p>
      </div>
    </div>
  );
}
