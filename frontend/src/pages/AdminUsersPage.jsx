import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { formatDate, getErrorMessage } from '../utils/helpers';
import {
  UsersIcon, MagnifyingGlassIcon, TrashIcon,
  CheckCircleIcon, XCircleIcon, UserCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const limit = 15;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/admin/users/${id}`);
      showToast('User deleted successfully.');
      setConfirmDelete(null);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setDeleting(null);
    }
  };

  const pages = Math.ceil(total / limit);
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-slide-up
          ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.type === 'error'
            ? <XCircleIcon className="w-4 h-4" />
            : <CheckCircleIcon className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-slide-up">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete User?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete <strong>{confirmDelete.fullname}</strong> and all their data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting === confirmDelete.id}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {deleting === confirmDelete.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="section-label text-purple-500">User Management</div>
        <h1 className="page-title">All Users</h1>
        <p className="text-gray-500 text-sm">Manage registered users — view, search, and remove accounts.</p>
      </div>

      {/* Search & Stats */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="input-field pl-9 text-sm py-2.5"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UsersIcon className="w-4 h-4" />
            <span><strong className="text-gray-900">{total}</strong> total users</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Email', 'Phone', 'Age', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <UserCircleIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No users found</p>
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(u.fullname)}
                      </div>
                      <span className="font-medium text-gray-900 whitespace-nowrap">{u.fullname}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs">{u.email}</td>
                  <td className="py-3.5 px-4 text-gray-500 text-xs whitespace-nowrap">{u.phone || '—'}</td>
                  <td className="py-3.5 px-4 text-gray-700 font-medium">{u.age || '—'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                      ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setConfirmDelete(u)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete user"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {page} of {pages} — {total} users
            </p>
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
