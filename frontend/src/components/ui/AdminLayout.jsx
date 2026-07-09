import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UsersIcon, ClipboardDocumentListIcon,
  Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
  HeartIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

const adminLinks = [
  { to: '/admin', icon: HomeIcon, label: 'Dashboard' },
  { to: '/admin/users', icon: UsersIcon, label: 'User Management' },
  { to: '/admin/assessments', icon: ClipboardDocumentListIcon, label: 'Assessments' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-rose-600 rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>CuraBreast</div>
            <div className="text-xs text-purple-500 font-semibold tracking-wide">Admin Panel</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-purple-50">
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {getInitials(user?.fullname)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 text-sm truncate">{user?.fullname}</div>
            <div className="text-xs text-purple-500 font-medium">Administrator</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 px-4 mb-3">Admin Menu</div>
        {adminLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'}`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-purple-50">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]"><SidebarContent /></div>
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-20">
          <span className="font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Panel</span>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
        <main className="p-4 md:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
