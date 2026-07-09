import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatDateTime } from '../utils/helpers';
import {
  UsersIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon,
  UserPlusIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setData(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}</div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  const { stats, recent_users = [], recent_assessments = [] } = data || {};

  const riskDistribution = [
    { name: 'Low Risk', value: recent_assessments.filter(a => a.risk_level === 'low').length },
    { name: 'Moderate', value: recent_assessments.filter(a => a.risk_level === 'moderate').length },
    { name: 'High Risk', value: recent_assessments.filter(a => a.risk_level === 'high').length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="section-label text-purple-500">Admin Panel</div>
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Platform statistics and recent activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <UsersIcon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-0.5">{stats?.total_users || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Total Users</div>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-0.5">{stats?.total_assessments || 0}</div>
          <div className="text-sm text-gray-500 font-medium">Total Assessments</div>
        </div>

        <div className="card bg-red-50 border-red-100">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-700 mb-0.5">{stats?.high_risk_cases || 0}</div>
          <div className="text-sm text-red-500 font-medium">High Risk Cases</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk distribution pie */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Risk Level Distribution</h3>
          {riskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {riskDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No assessment data yet</div>
          )}
        </div>

        {/* Recent registrations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Registrations</h3>
            <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-semibold">Last 5</span>
          </div>
          <div className="space-y-3">
            {recent_users.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">No users yet</div>
            ) : recent_users.map(u => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.fullname?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{u.fullname}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(u.created_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent assessments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Assessments</h3>
          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">Last 5</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['User', 'Email', 'Risk Level', 'Score', 'Date'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent_assessments.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No assessments yet</td></tr>
              ) : recent_assessments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 font-medium text-gray-900">{a.fullname}</td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{a.email}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                      ${a.risk_level === 'high' ? 'bg-red-100 text-red-700' : a.risk_level === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {a.risk_level === 'high' ? '🔴' : a.risk_level === 'moderate' ? '🟡' : '🟢'} {a.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-700">{a.risk_score}/100</td>
                  <td className="py-3 px-3 text-xs text-gray-400">{formatDateTime(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
