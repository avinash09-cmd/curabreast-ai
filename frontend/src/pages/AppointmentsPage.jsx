import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatDateTime, getErrorMessage } from '../utils/helpers';
import { CalendarDaysIcon, PlusIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const statusStyles = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-amber-100 text-amber-700',
};

const HOSPITALS = [
  'Tata Memorial Hospital, Mumbai',
  'AIIMS New Delhi',
  'Apollo Hospitals, Chennai',
  'Kidwai Memorial Institute, Bengaluru',
  'Fortis Hospital, Gurugram',
  'Medanta – The Medicity, Gurugram',
  'Regional Cancer Centre, Thiruvananthapuram',
  'Other',
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hospital_name: '', appointment_date: '', doctor_name: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/users/appointments');
      setAppointments(data.appointments || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await api.post('/users/appointments', form);
      setSuccess('Appointment booked successfully!');
      setShowForm(false);
      setForm({ hospital_name: '', appointment_date: '', doctor_name: '', notes: '' });
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setSubmitting(false); }
  };

  const upcoming = appointments.filter(a => a.status === 'scheduled' && new Date(a.appointment_date) >= new Date());
  const past = appointments.filter(a => a.status !== 'scheduled' || new Date(a.appointment_date) < new Date());

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="section-label">Healthcare</div>
          <h1 className="page-title">My Appointments</h1>
          <p className="text-gray-500 text-sm">Track and manage your hospital appointments.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
          <PlusIcon className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" /> {success}
        </div>
      )}

      {/* Booking form */}
      {showForm && (
        <div className="card border-rose-100 shadow-md animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Book New Appointment</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hospital / Clinic <span className="text-red-500">*</span></label>
              <select
                className="input-field"
                value={form.hospital_name}
                onChange={e => setForm(f => ({ ...f, hospital_name: e.target.value }))}
                required
              >
                <option value="">Select a hospital...</option>
                {HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Date & Time <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.appointment_date}
                onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor's Name (optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Dr. Priya Sharma"
                value={form.doctor_name}
                onChange={e => setForm(f => ({ ...f, doctor_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Any specific concerns or requirements..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Booking...' : 'Confirm Appointment'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card text-center py-16">
          <CalendarDaysIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No appointments yet</p>
          <p className="text-gray-400 text-sm mb-4">Book your first appointment with a breast health specialist.</p>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2 px-4 inline-block">Book Now</button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Upcoming ({upcoming.length})</h3>
              <div className="space-y-3">
                {upcoming.map(a => (
                  <AppointmentCard key={a.id} appointment={a} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Past & Completed ({past.length})</h3>
              <div className="space-y-3">
                {past.map(a => (
                  <AppointmentCard key={a.id} appointment={a} past />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AppointmentCard({ appointment: a, past }) {
  return (
    <div className={`card flex items-start gap-4 ${past ? 'opacity-70' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${past ? 'bg-gray-100' : 'bg-rose-50'}`}>
        <CalendarDaysIcon className={`w-6 h-6 ${past ? 'text-gray-400' : 'text-rose-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{a.hospital_name}</h4>
            {a.doctor_name && <p className="text-xs text-gray-500 mt-0.5">{a.doctor_name}</p>}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${statusStyles[a.status] || 'bg-gray-100 text-gray-600'}`}>
            {a.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
          <CalendarDaysIcon className="w-3.5 h-3.5" />
          {formatDateTime(a.appointment_date)}
        </div>
        {a.notes && <p className="text-xs text-gray-500 mt-1.5 italic">"{a.notes}"</p>}
      </div>
    </div>
  );
}
