import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import api from '../utils/api';
import { formatDate, getErrorMessage } from '../utils/helpers';
import {
  CalendarDaysIcon, PlusIcon, ChartBarIcon,
  CheckCircleIcon, XMarkIcon, TrashIcon,
  ArrowLeftIcon, ArrowRightIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
const MOODS = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'irritable', label: '😠 Irritable' },
  { value: 'energetic', label: '⚡ Energetic' },
  { value: 'tired', label: '😴 Tired' },
];

const FLOWS = [
  { value: 'spotting', label: '· Spotting' },
  { value: 'light', label: '▸ Light' },
  { value: 'medium', label: '▸▸ Medium' },
  { value: 'heavy', label: '▸▸▸ Heavy' },
];

const SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Back pain', 'Breast tenderness',
  'Nausea', 'Fatigue', 'Acne', 'Food cravings', 'Insomnia',
  'Hot flashes', 'Dizziness', 'Mood swings', 'Spotting',
];

const MOOD_COLORS = {
  happy: '#22c55e', neutral: '#94a3b8', sad: '#60a5fa',
  anxious: '#f59e0b', irritable: '#ef4444', energetic: '#a855f7', tired: '#6b7280'
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function PeriodCalendar({ logs, prediction, onDayClick }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build sets of special dates
  const periodDays = new Set();
  const fertilityDays = new Set();
  let ovulationDay = null;
  let predictedDay = null;

  logs.forEach(log => {
    const start = new Date(log.cycle_start);
    const length = log.period_length || 5;
    for (let i = 0; i < length; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      if (d.getFullYear() === year && d.getMonth() === month) {
        periodDays.add(d.getDate());
      }
    }
  });

  if (prediction) {
    const fStart = new Date(prediction.fertility_start);
    const fEnd = new Date(prediction.fertility_end);
    const ov = new Date(prediction.ovulation_date);
    const np = new Date(prediction.next_period);

    for (let d = new Date(fStart); d <= fEnd; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        fertilityDays.add(d.getDate());
      }
    }
    if (ov.getFullYear() === year && ov.getMonth() === month) ovulationDay = ov.getDate();
    if (np.getFullYear() === year && np.getMonth() === month) predictedDay = np.getDate();
  }

  const today = new Date();
  const isToday = (d) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="card">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
          {MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowRightIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const isPeriod = periodDays.has(day);
          const isFertile = fertilityDays.has(day);
          const isOvulation = ovulationDay === day;
          const isPredicted = predictedDay === day;
          const todayFlag = isToday(day);

          let classes = 'w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-all hover:scale-110 ';

          if (isPeriod) classes += 'bg-rose-500 text-white shadow-sm ';
          else if (isOvulation) classes += 'bg-purple-500 text-white shadow-sm ';
          else if (isPredicted) classes += 'bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-200 border-2 border-rose-400 border-dashed ';
          else if (isFertile) classes += 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ';
          else if (todayFlag) classes += 'ring-2 ring-rose-400 text-gray-900 dark:text-gray-100 ';
          else classes += 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 ';

          return (
            <div key={day} className="flex justify-center py-0.5">
              <div
                className={classes}
                onClick={() => onDayClick?.(new Date(year, month, day))}
                title={
                  isPeriod ? 'Period day' :
                  isOvulation ? 'Predicted ovulation' :
                  isPredicted ? 'Predicted period start' :
                  isFertile ? 'Fertility window' : ''
                }
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        {[
          { color: 'bg-rose-500', label: 'Period' },
          { color: 'bg-green-100 dark:bg-green-900/40 border border-green-300', label: 'Fertile window' },
          { color: 'bg-purple-500', label: 'Ovulation' },
          { color: 'bg-rose-200 dark:bg-rose-800 border-2 border-dashed border-rose-400', label: 'Predicted' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Log Period Form ──────────────────────────────────────────────────────────
function LogPeriodForm({ onClose, onSuccess, editLog = null }) {
  const [form, setForm] = useState({
    cycle_start: editLog?.cycle_start?.split('T')[0] || new Date().toISOString().split('T')[0],
    cycle_end: editLog?.cycle_end?.split('T')[0] || '',
    flow: editLog?.flow || 'medium',
    mood: editLog?.mood || 'neutral',
    symptoms: editLog?.symptoms || [],
    notes: editLog?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (sym) => {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(sym)
        ? f.symptoms.filter(s => s !== sym)
        : [...f.symptoms, sym]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (editLog) {
        await api.put(`/period/log/${editLog.id}`, form);
      } else {
        await api.post('/period/log', form);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {editLog ? 'Update Period Log' : 'Log Period'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="input-field"
                value={form.cycle_start}
                onChange={e => setForm(f => ({ ...f, cycle_start: e.target.value }))}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
              <input
                type="date"
                className="input-field"
                value={form.cycle_end}
                onChange={e => setForm(f => ({ ...f, cycle_end: e.target.value }))}
                min={form.cycle_start}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Flow</label>
            <div className="flex gap-2 flex-wrap">
              {FLOWS.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, flow: value }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    form.flow === value
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-rose-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, mood: value }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    form.mood === value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map(sym => (
                <button
                  key={sym} type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.symptoms.includes(sym)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : editLog ? 'Update Log' : 'Save Period Log'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-4">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PeriodTrackerPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [historyRes, statsRes, predictRes] = await Promise.all([
        api.get('/period/history?limit=24'),
        api.get('/period/stats'),
        api.get('/period/predict'),
      ]);
      setLogs(historyRes.data.logs || []);
      setStats(statsRes.data.stats || null);
      setPrediction(predictRes.data.prediction || null);
    } catch (err) {
      console.error('Period tracker load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this period log?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/period/log/${id}`);
      load();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const TABS = ['overview', 'calendar', 'history', 'stats'];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="section-label flex items-center gap-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            Menstrual Health
          </div>
          <h1 className="page-title">Period Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track your cycle, predict your next period, and monitor your health.</p>
        </div>
        <button
          onClick={() => { setEditLog(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          <PlusIcon className="w-4 h-4" /> Log Period
        </button>
      </div>

      {/* Quick Stats Row */}
      {prediction ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl mb-1">🩸</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{prediction.days_until_next > 0 ? prediction.days_until_next : 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Days until next period</div>
          </div>
          <div className="card">
            <div className="text-2xl mb-1">📅</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{prediction.current_cycle_day ? `Day ${prediction.current_cycle_day}` : '—'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Current cycle day</div>
          </div>
          <div className="card">
            <div className="text-2xl mb-1">🌸</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {prediction.ovulation_date ? formatDate(prediction.ovulation_date) : '—'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Predicted ovulation</div>
          </div>
          <div className="card">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{prediction.avg_cycle_length || 28}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Avg cycle length (days)</div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-8 bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30">
          <div className="text-3xl mb-2">🩸</div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Start tracking your cycle</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Log your first period to unlock predictions, fertility windows, and health insights.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Log First Period
          </button>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && prediction && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="section-label">Prediction</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Next Cycle Forecast</h3>
            <div className="space-y-3">
              {[
                { label: 'Next period starts', value: formatDate(prediction.next_period), icon: '🩸' },
                { label: 'Fertility window', value: `${formatDate(prediction.fertility_start)} – ${formatDate(prediction.fertility_end)}`, icon: '🌱' },
                { label: 'Ovulation day', value: formatDate(prediction.ovulation_date), icon: '🌸' },
                { label: 'Avg cycle length', value: `${prediction.avg_cycle_length} days`, icon: '🔄' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-label">Last Log</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Most Recent Period</h3>
            {logs[0] ? (
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                  <div className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    {formatDate(logs[0].cycle_start)}
                    {logs[0].cycle_end && ` – ${formatDate(logs[0].cycle_end)}`}
                  </div>
                  <div className="text-xs text-rose-500 dark:text-rose-400 mt-0.5">
                    {logs[0].period_length ? `${logs[0].period_length} days` : 'End date not logged'}
                  </div>
                </div>
                {logs[0].flow && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Flow</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{logs[0].flow}</span>
                  </div>
                )}
                {logs[0].mood && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Mood</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{MOODS.find(m => m.value === logs[0].mood)?.label || logs[0].mood}</span>
                  </div>
                )}
                {logs[0].symptoms?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">Symptoms</div>
                    <div className="flex flex-wrap gap-1">
                      {logs[0].symptoms.map(s => (
                        <span key={s} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-800 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => { setEditLog(logs[0]); setShowForm(true); }}
                  className="btn-secondary text-xs py-2 w-full"
                >
                  Update this log (add end date, etc.)
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">No logs yet</div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <PeriodCalendar
          logs={logs}
          prediction={prediction}
          onDayClick={(date) => {
            setForm?.({ ...form, cycle_start: date.toISOString().split('T')[0] });
            setShowForm(true);
          }}
        />
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="section-label">Cycle History</div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">All Period Logs</h3>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <CalendarDaysIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No periods logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🩸</div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(log.cycle_start)}
                        {log.cycle_end && <span className="text-gray-400 dark:text-gray-500"> → {formatDate(log.cycle_end)}</span>}
                      </div>
                      <div className="flex gap-2 mt-0.5">
                        {log.period_length && <span className="text-xs text-gray-400 dark:text-gray-500">{log.period_length}d period</span>}
                        {log.cycle_length && <span className="text-xs text-gray-400 dark:text-gray-500">· {log.cycle_length}d cycle</span>}
                        {log.flow && <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">· {log.flow} flow</span>}
                        {log.mood && <span className="text-xs text-gray-400 dark:text-gray-500">· {MOODS.find(m => m.value === log.mood)?.label?.split(' ')[0]}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditLog(log); setShowForm(true); }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Cycle length chart */}
          {stats.chart_data?.length > 1 && (
            <div className="card">
              <div className="section-label">Analytics</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Cycle & Period Length Trends</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-border-opacity, #e5e7eb)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Bar dataKey="cycle_length" name="Cycle length (days)" fill="#f43f5e" radius={[4,4,0,0]} />
                  <Bar dataKey="period_length" name="Period length (days)" fill="#fda4af" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Mood distribution */}
          {Object.keys(stats.mood_distribution || {}).length > 0 && (
            <div className="card">
              <div className="section-label">Mood Trends</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Mood Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats.mood_distribution).map(([k, v]) => ({ name: k, value: v }))}
                    cx="50%" cy="50%" outerRadius={75} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {Object.keys(stats.mood_distribution).map((key, i) => (
                      <Cell key={i} fill={MOOD_COLORS[key] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Symptom frequency */}
          {Object.keys(stats.symptom_frequency || {}).length > 0 && (
            <div className="card">
              <div className="section-label">Symptoms</div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Symptom Frequency</h3>
              <div className="space-y-2">
                {Object.entries(stats.symptom_frequency)
                  .sort(([,a],[,b]) => b - a)
                  .map(([sym, count]) => (
                    <div key={sym} className="flex items-center gap-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 w-28 flex-shrink-0">{sym}</div>
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${(count / stats.total_cycles) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 w-8 text-right">{count}x</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Summary numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total cycles tracked', value: stats.total_cycles },
              { label: 'Avg cycle length', value: stats.avg_cycle_length ? `${stats.avg_cycle_length}d` : '—' },
              { label: 'Avg period length', value: stats.avg_period_length ? `${stats.avg_period_length}d` : '—' },
              { label: 'Shortest / Longest cycle', value: stats.min_cycle && stats.max_cycle ? `${stats.min_cycle}d / ${stats.max_cycle}d` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value || '—'}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && !stats?.total_cycles && (
        <div className="card text-center py-12 text-gray-400 dark:text-gray-500">
          <ChartBarIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Log at least 2 periods to see statistics.</p>
        </div>
      )}

      {/* Log form modal */}
      {showForm && (
        <LogPeriodForm
          editLog={editLog}
          onClose={() => { setShowForm(false); setEditLog(null); }}
          onSuccess={load}
        />
      )}
    </div>
  );
}
