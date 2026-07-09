import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { HeartIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [debugToken, setDebugToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.debug_token) setDebugToken(data.debug_token);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
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
        </div>

        <div className="card shadow-xl border-0">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-4">
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              </p>
              {debugToken && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-left">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Dev mode — Reset Token:</p>
                  <p className="text-xs text-blue-500 break-all font-mono">{debugToken}</p>
                  <Link to={`/reset-password?token=${debugToken}`} className="text-xs text-blue-700 font-semibold mt-1 block hover:underline">
                    → Click here to reset password
                  </Link>
                </div>
              )}
              <Link to="/login" className="btn-primary w-full block text-center">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Reset your password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-rose-600 hover:text-rose-700 font-medium">← Back to Sign In</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 gradient-rose rounded-xl flex items-center justify-center shadow-md">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>CuraBreast <span className="text-rose-500">AI</span></span>
          </Link>
        </div>

        <div className="card shadow-xl border-0">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-4">Your password has been updated successfully.</p>
              <Link to="/login" className="btn-primary w-full block text-center">Sign In Now</Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Set new password</h2>
              <p className="text-gray-500 text-sm mb-6">Choose a strong password for your account.</p>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input type="password" className="input-field" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
