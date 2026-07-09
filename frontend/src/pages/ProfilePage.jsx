import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getErrorMessage, formatDate } from '../utils/helpers';
import {
  UserCircleIcon, PencilSquareIcon, LockClosedIcon,
  CheckCircleIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Alert = ({ type, msg }) => {
  if (!msg) return null;
  const styles = type === 'success'
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-red-50 border-red-200 text-red-700';
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${styles}`}>
      {type === 'success' ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> : '⚠️'}
      {msg}
    </div>
  );
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ fullname: '', email: '', phone: '', age: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [profileStatus, setProfileStatus] = useState({ type: '', msg: '' });
  const [pwStatus, setPwStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      const u = data.user;
      setProfile({ fullname: u.fullname || '', email: u.email || '', phone: u.phone || '', age: u.age || '' });
    });
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileStatus({ type: '', msg: '' });
    try {
      const { data } = await api.put('/users/profile', {
        fullname: profile.fullname,
        phone: profile.phone,
        age: profile.age
      });
      updateUser(data.user);
      setProfileStatus({ type: 'success', msg: 'Profile updated successfully.' });
    } catch (err) {
      setProfileStatus({ type: 'error', msg: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      return setPwStatus({ type: 'error', msg: 'New passwords do not match.' });
    }
    setPwLoading(true);
    setPwStatus({ type: '', msg: '' });
    try {
      await api.put('/users/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password
      });
      setPwStatus({ type: 'success', msg: 'Password changed successfully.' });
      setPwForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwStatus({ type: 'error', msg: getErrorMessage(err) });
    } finally {
      setPwLoading(false);
    }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <div className="section-label">Account Settings</div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your personal information and account security.</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-5">
        <div className="w-20 h-20 gradient-rose rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
          {getInitials(profile.fullname)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{profile.fullname}</h2>
          <p className="text-gray-500 text-sm">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full font-semibold">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              {user?.role === 'admin' ? 'Administrator' : 'Health Member'}
            </span>
            <span className="text-xs text-gray-400">Member since {formatDate(user?.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <PencilSquareIcon className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900">Personal Information</h3>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <Alert {...profileStatus} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={profile.fullname}
              onChange={e => setProfile(p => ({ ...p, fullname: e.target.value }))}
              minLength={2} required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" className="input-field bg-gray-50 cursor-not-allowed" value={profile.email} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+91-9876543210"
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
              <input
                type="number"
                className="input-field"
                min={18} max={120}
                value={profile.age}
                onChange={e => setProfile(p => ({ ...p, age: e.target.value }))}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <LockClosedIcon className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Alert {...pwStatus} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Your current password"
              value={pwForm.current_password}
              onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min. 8 characters"
              value={pwForm.new_password}
              onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))}
              required minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Repeat new password"
              value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              required
            />
          </div>

          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
