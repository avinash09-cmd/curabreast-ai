import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, getRiskColor, getRiskBadge } from '../utils/helpers';
import {
  ClipboardDocumentListIcon, DocumentTextIcon, MapPinIcon,
  CalendarDaysIcon, ArrowRightIcon, SparklesIcon,
  ChartBarIcon, HeartIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

const quickActions = [
  { to: '/assessment', icon: ClipboardDocumentListIcon, label: 'New Assessment', desc: 'Check your risk level', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
  { to: '/appointments', icon: CalendarDaysIcon, label: 'Book Appointment', desc: 'Schedule a check-up', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { to: '/reports', icon: DocumentTextIcon, label: 'View Reports', desc: 'See your history', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { to: '/hospitals', icon: MapPinIcon, label: 'Find Hospitals', desc: 'Nearby clinics', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/assessment/stats'),
          api.get('/assessment/history?limit=5')
        ]);
        setStats(statsRes.data.stats);
        setAssessments(historyRes.data.assessments);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = stats?.trend?.map(t => ({
    month: new Date(t.month).toLocaleDateString('en-IN', { month: 'short' }),
    score: Math.round(parseFloat(t.avg_score)),
    count: parseInt(t.count)
  })).reverse() || [];

  const getRiskLevelConfig = (level) => {
    switch (level) {
      case 'low': return { color: 'text-green-600', bg: 'bg-green-50', icon: '🟢', label: 'Low Risk' };
      case 'moderate': return { color: 'text-amber-600', bg: 'bg-amber-50', icon: '🟡', label: 'Moderate Risk' };
      case 'high': return { color: 'text-red-600', bg: 'bg-red-50', icon: '🔴', label: 'High Risk' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', icon: '⚪', label: 'No Data' };
    }
  };

  const currentRisk = getRiskLevelConfig(stats?.last_assessment?.risk_level);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="gradient-rose rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-5 h-5 text-rose-200" />
              <span className="text-rose-200 text-sm font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
              {user?.fullname?.split(' ')[0]} 👋
            </h1>
            <p className="text-rose-100 text-sm">
              {stats?.last_assessment
                ? `Last assessment: ${formatDate(stats.last_assessment.created_at)}`
                : 'Complete your first health assessment today'
              }
            </p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-rose-200 text-xs mb-1">Age</div>
            <div className="text-2xl font-bold">{user?.age || '—'}</div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-3">
            <ClipboardDocumentListIcon className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.total_assessments || 0}</div>
          <div className="text-xs text-gray-500 font-medium">Total Assessments</div>
        </div>

        <div className={`card ${currentRisk.bg}`}>
          <div className="text-2xl mb-3">{currentRisk.icon}</div>
          <div className={`text-lg font-bold mb-0.5 ${currentRisk.color}`}>{currentRisk.label}</div>
          <div className="text-xs text-gray-500 font-medium">Current Risk</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.appointments_booked || 0}</div>
          <div className="text-xs text-gray-500 font-medium">Appointments</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <ChartBarIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-0.5">{stats?.avg_risk_score || 0}</div>
          <div className="text-xs text-gray-500 font-medium">Avg Risk Score</div>
        </div>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-label">Analytics</div>
              <h3 className="font-bold text-gray-900">Risk Score Trend</h3>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
                <Area type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={2.5} fill="url(#riskGrad)" dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <ChartBarIcon className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Complete assessments to see your trend</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-label">Quick Actions</div>
          <h3 className="font-bold text-gray-900 mb-4">What would you like to do?</h3>
          <div className="space-y-2">
            {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
              <Link key={to} to={to} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${color}`}>
                <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs opacity-70">{desc}</div>
                </div>
                <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-label">History</div>
            <h3 className="font-bold text-gray-900">Recent Assessments</h3>
          </div>
          <Link to="/reports" className="text-sm text-rose-600 font-medium hover:text-rose-700 flex items-center gap-1">
            View all <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {assessments.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <ClipboardDocumentListIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm mb-3">No assessments yet</p>
            <Link to="/assessment" className="btn-primary text-sm py-2 px-4 inline-block">Start Your First Assessment</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg">
                    {a.risk_level === 'high' ? '🔴' : a.risk_level === 'moderate' ? '🟡' : '🟢'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 capitalize">{a.risk_level} Risk</div>
                    <div className="text-xs text-gray-500">{formatDate(a.created_at)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{a.risk_score}<span className="text-xs text-gray-400">/100</span></div>
                  <div className="text-xs text-gray-400">Risk Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health tip banner */}
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <HeartIcon className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <div className="font-semibold text-rose-900 mb-1">💡 Health Tip</div>
          <p className="text-sm text-rose-700">
            Monthly breast self-examinations are most effective when done 3–5 days after your period ends. 
            Look for new lumps, skin dimpling, nipple changes, or unexplained pain. Early detection saves lives.
          </p>
        </div>
      </div>
    </div>
  );
}
