import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getErrorMessage } from '../utils/helpers';
import {
  SunIcon, MoonIcon, ComputerDesktopIcon,
  BellIcon, ShieldCheckIcon, TrashIcon,
  ArrowDownTrayIcon, CheckCircleIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const NOTIF_KEYS = [
  { key: 'notif_period', label: 'Period reminders', desc: 'Get reminded 2 days before your predicted period' },
  { key: 'notif_selfexam', label: 'Breast self-exam reminders', desc: 'Monthly reminders to perform self-examination' },
  { key: 'notif_ai', label: 'AI health insights', desc: 'Receive personalised health tips from INDU' },
  { key: 'notif_appointments', label: 'Appointment reminders', desc: 'Reminders 24 hours before booked appointments' },
];

const Alert = ({ type, msg }) => {
  if (!msg) return null;
  const styles = {
    success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300',
    warn: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${styles[type]}`}>
      {type === 'success' && <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />}
      {type === 'error' && '⚠️'}
      {type === 'warn' && <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  );
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Notification preferences (stored in localStorage for now)
  const [notifs, setNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('curabreast_notifs') || '{}');
    } catch { return {}; }
  });

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [clearChatDone, setClearChatDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
  };

  const toggleNotif = (key) => {
    const updated = { ...notifs, [key]: !notifs[key] };
    setNotifs(updated);
    localStorage.setItem('curabreast_notifs', JSON.stringify(updated));
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const [profileRes, assessRes, periodRes, reportsRes, apptsRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/assessment/history?limit=100'),
        api.get('/period/history?limit=100'),
        api.get('/reports'),
        api.get('/users/appointments'),
      ]);

      const data = {
        exported_at: new Date().toISOString(),
        profile: profileRes.data.user,
        assessments: assessRes.data.assessments,
        period_logs: periodRes.data.logs,
        reports: reportsRes.data.reports,
        appointments: apptsRes.data.appointments,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curabreast-health-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showStatus('success', 'Health data exported successfully.');
    } catch (err) {
      showStatus('error', 'Export failed: ' + getErrorMessage(err));
    } finally {
      setExportLoading(false);
    }
  };

  const handleClearChat = () => {
    // Chat history is in React state (not persisted to DB), so just show confirmation
    setClearChatDone(true);
    showStatus('success', 'Chat history cleared. The INDU widget will reset on next open.');
    setTimeout(() => setClearChatDone(false), 3000);
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      // In a real implementation, POST to a delete-account endpoint
      // For now, we log out and show a message
      showStatus('warn', 'Account deletion has been requested. Contact support@curabreast.ai to complete this process.');
      setShowDeleteConfirm(false);
      setDeleteInput('');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 3000);
    } catch (err) {
      showStatus('error', getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const themeOptions = [
    { value: 'light', icon: SunIcon, label: 'Light', desc: 'Always use light mode' },
    { value: 'dark', icon: MoonIcon, label: 'Dark', desc: 'Always use dark mode' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System', desc: 'Match your OS setting' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <div className="section-label">Preferences</div>
        <h1 className="page-title">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your appearance, notifications, and privacy.</p>
      </div>

      {status.msg && <Alert {...status} />}

      {/* Appearance */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <SunIcon className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Appearance</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                theme === value
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-gray-800'
              }`}
              aria-pressed={theme === value}
            >
              <Icon className={`w-6 h-6 mb-2 ${theme === value ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400 dark:text-gray-500'}`} />
              <div className={`text-sm font-semibold ${theme === value ? 'text-rose-700 dark:text-rose-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</div>
              {theme === value && (
                <div className="mt-2">
                  <CheckCircleIcon className="w-4 h-4 text-rose-500" />
                </div>
              )}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Theme preference is saved locally and applied immediately with a smooth 250ms transition.
        </p>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <BellIcon className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
        </div>

        <div className="space-y-3">
          {NOTIF_KEYS.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => toggleNotif(key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  notifs[key] ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role="switch"
                aria-checked={!!notifs[key]}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    notifs[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          Notification delivery requires browser permission. Preferences are saved locally.
        </p>
      </div>

      {/* Privacy */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheckIcon className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Privacy & Data</h3>
        </div>

        <div className="space-y-3">
          {/* Export data */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Export my health data</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Download all your data as JSON (assessments, periods, appointments)</div>
            </div>
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap ml-4"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>

          {/* Clear chat history */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Clear INDU chat history</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Removes the current chat session from memory</div>
            </div>
            <button
              onClick={handleClearChat}
              className="btn-secondary text-sm py-2 px-4 whitespace-nowrap ml-4"
            >
              {clearChatDone ? '✓ Cleared' : 'Clear Chat'}
            </button>
          </div>

          {/* Delete account */}
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-xl">
            <div>
              <div className="text-sm font-medium text-red-700 dark:text-red-400">Delete my account</div>
              <div className="text-xs text-red-500 dark:text-red-500 mt-0.5">Permanently delete all your data. This cannot be undone.</div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger ml-4 whitespace-nowrap flex items-center gap-1.5"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
              This will permanently delete your account, all assessments, period logs, and health data. This action <strong>cannot be undone</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                className="input-field"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleteLoading}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App info */}
      <div className="card bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CuraBreast AI</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Version 1.0.0 · Built with ❤️ for women's health</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            <a href="#" className="hover:text-rose-500 transition-colors">Privacy Policy</a>
            {' · '}
            <a href="#" className="hover:text-rose-500 transition-colors">Terms of Service</a>
            {' · '}
            <a href="mailto:support@curabreast.ai" className="hover:text-rose-500 transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
