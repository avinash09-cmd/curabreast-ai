import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatDateTime } from '../utils/helpers';
import {
  ClipboardDocumentListIcon, FunnelIcon,
  ArrowDownTrayIcon, ChevronDownIcon, ChevronUpIcon
} from '@heroicons/react/24/outline';

const RiskBadge = ({ level }) => {
  const styles = {
    low: 'bg-green-100 text-green-700',
    moderate: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };
  const icons = { low: '🟢', moderate: '🟡', high: '🔴' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[level] || 'bg-gray-100 text-gray-600'}`}>
      {icons[level]} {level}
    </span>
  );
};

export default function AdminAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (riskFilter !== 'all') params.append('risk_level', riskFilter);
      const { data } = await api.get(`/admin/assessments?${params}`);
      setAssessments(data.assessments || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, riskFilter]);

  useEffect(() => { load(); }, [load]);

  const downloadCSV = () => {
    const headers = ['User', 'Email', 'Age', 'Risk Level', 'Score', 'Date', 'Recommendation'];
    const rows = assessments.map(a => [
      a.fullname,
      a.email,
      a.age,
      a.risk_level,
      a.risk_score,
      formatDateTime(a.created_at),
      `"${a.recommendation?.replace(/"/g, "'")}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curabreast-assessments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-label text-purple-500">Assessment Management</div>
        <h1 className="page-title">All Assessments</h1>
        <p className="text-gray-500 text-sm">View and export all breast health risk assessments across the platform.</p>
      </div>

      {/* Filters & Export */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 mr-2">Filter by risk:</span>
            {['all', 'low', 'moderate', 'high'].map(f => (
              <button
                key={f}
                onClick={() => { setRiskFilter(f); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize
                  ${riskFilter === f
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500"><strong className="text-gray-900">{total}</strong> records</span>
            <button
              onClick={downloadCSV}
              className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Risk summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { level: 'low', label: 'Low Risk', color: 'text-green-600 bg-green-50 border-green-100', icon: '🟢' },
          { level: 'moderate', label: 'Moderate Risk', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: '🟡' },
          { level: 'high', label: 'High Risk', color: 'text-red-600 bg-red-50 border-red-100', icon: '🔴' },
        ].map(({ level, label, color, icon }) => {
          const count = assessments.filter(a => a.risk_level === level).length;
          return (
            <div
              key={level}
              onClick={() => { setRiskFilter(level); setPage(1); }}
              className={`card cursor-pointer border hover:shadow-md transition-all text-center ${color} ${riskFilter === level ? 'ring-2 ring-offset-1 ring-current' : ''}`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs font-semibold mt-0.5">{label}</div>
              <div className="text-xs opacity-60 mt-0.5">on this page</div>
            </div>
          );
        })}
      </div>

      {/* Assessments table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Age', 'Risk Level', 'Score', 'Date', 'Details'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <ClipboardDocumentListIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No assessments found</p>
                  </td>
                </tr>
              ) : assessments.map(a => (
                <React.Fragment key={a.id}>
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{a.fullname}</div>
                        <div className="text-xs text-gray-400">{a.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{a.age}</td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={a.risk_level} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${a.risk_score < 30 ? 'bg-green-400' : a.risk_score < 60 ? 'bg-amber-400' : 'bg-red-500'}`}
                            style={{ width: `${a.risk_score}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-700 text-xs">{a.risk_score}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(a.created_at)}</td>
                    <td className="py-3.5 px-4">
                      {expanded === a.id
                        ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                        : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      }
                    </td>
                  </tr>
                  {expanded === a.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-3">
                          {/* Symptom flags */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assessment Details</p>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { key: 'family_history', label: 'Family History' },
                                { key: 'lump_detected', label: 'Lump Detected' },
                                { key: 'breast_pain', label: 'Breast Pain' },
                                { key: 'skin_changes', label: 'Skin Changes' },
                                { key: 'nipple_discharge', label: 'Nipple Discharge' },
                                { key: 'smoking_history', label: 'Smoking History' },
                              ].map(({ key, label }) => (
                                <span
                                  key={key}
                                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${a[key]
                                    ? 'bg-red-50 text-red-600 border-red-100'
                                    : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                                >
                                  {a[key] ? '✓' : '✗'} {label}
                                </span>
                              ))}
                              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium capitalize">
                                Alcohol: {a.alcohol_consumption}
                              </span>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100 font-medium capitalize">
                                Activity: {a.physical_activity}
                              </span>
                            </div>
                          </div>
                          {/* Recommendation */}
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Recommendation</p>
                            <p className="text-xs text-gray-600 leading-relaxed">{a.recommendation}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
