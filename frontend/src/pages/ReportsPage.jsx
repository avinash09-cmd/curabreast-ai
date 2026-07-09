import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatDateTime, getRiskColor } from '../utils/helpers';
import {
  DocumentTextIcon, FunnelIcon, MagnifyingGlassIcon,
  ArrowDownTrayIcon, ChevronDownIcon, ChevronUpIcon
} from '@heroicons/react/24/outline';

const RiskBadge = ({ level }) => {
  const styles = {
    low: 'bg-green-100 text-green-700',
    moderate: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[level] || 'bg-gray-100 text-gray-600'}`}>
      {level === 'low' ? '🟢' : level === 'moderate' ? '🟡' : '🔴'} {level} risk
    </span>
  );
};

const ScoreBar = ({ score }) => {
  const color = score < 30 ? 'bg-green-400' : score < 60 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">{score}</span>
    </div>
  );
};

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/reports').then(({ data }) => {
      setReports(data.reports || []);
      setFiltered(data.reports || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = reports;
    if (filter !== 'all') result = result.filter(r => r.risk_level === filter);
    if (search) result = result.filter(r =>
      formatDateTime(r.created_at).toLowerCase().includes(search.toLowerCase()) ||
      r.risk_level?.includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [filter, search, reports]);

  const downloadCSV = () => {
    const headers = ['Date', 'Risk Level', 'Risk Score', 'Recommendation'];
    const rows = filtered.map(r => [
      formatDateTime(r.created_at),
      r.risk_level,
      r.risk_score,
      `"${r.recommendation?.replace(/"/g, "'")}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'curabreast-reports.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div>
        <div className="section-label">History</div>
        <h1 className="page-title">My Health Reports</h1>
        <p className="text-gray-500 text-sm">View and download your complete assessment history.</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-9 text-sm py-2.5"
              placeholder="Search reports..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'low', 'moderate', 'high'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize
                  ${filter === f ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'}`}
              >
                {f === 'all' ? 'All' : `${f.charAt(0).toUpperCase() + f.slice(1)}`}
              </button>
            ))}
          </div>
          <button onClick={downloadCSV} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 whitespace-nowrap">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {['low', 'moderate', 'high'].map(level => {
            const count = reports.filter(r => r.risk_level === level).length;
            const colors = { low: 'text-green-600 bg-green-50', moderate: 'text-amber-600 bg-amber-50', high: 'text-red-600 bg-red-50' };
            return (
              <div key={level} className={`card text-center ${colors[level]}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs font-semibold capitalize mt-1">{level} Risk</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reports list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No reports found</p>
          <p className="text-gray-400 text-sm mb-4">
            {reports.length === 0 ? 'Complete your first assessment to see your reports here.' : 'Try adjusting your filters.'}
          </p>
          {reports.length === 0 && (
            <Link to="/assessment" className="btn-primary text-sm py-2 px-4 inline-block">Start Assessment</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <div key={report.id} className="card hover:shadow-md transition-shadow">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{report.risk_level === 'high' ? '🔴' : report.risk_level === 'moderate' ? '🟡' : '🟢'}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <RiskBadge level={report.risk_level} />
                    </div>
                    <div className="text-xs text-gray-400">{formatDateTime(report.created_at)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block w-32">
                    <ScoreBar score={report.risk_score} />
                  </div>
                  {expanded === report.id
                    ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    : <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === report.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
                  <div className="sm:hidden"><ScoreBar score={report.risk_score} /></div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recommendation</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{report.recommendation}</p>
                  </div>

                  {report.report_data?.risk_factors?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Risk Factors Identified</p>
                      <div className="flex flex-wrap gap-2">
                        {report.report_data.risk_factors.map((f, i) => (
                          <span key={i} className="text-xs bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-full">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
