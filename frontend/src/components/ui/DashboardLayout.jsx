import React, { useState, lazy, Suspense } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HomeIcon, ClipboardDocumentListIcon, DocumentTextIcon,
  MapPinIcon, UserCircleIcon, CalendarDaysIcon,
  Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
  HeartIcon, ShieldCheckIcon, SunIcon, MoonIcon,
  ComputerDesktopIcon, Cog6ToothIcon
} from '@heroicons/react/24/outline';

// Lazy-load the chat widget — heavy component
const ChatWidget = lazy(() => import('./ChatWidget'));

const navLinks = [
  { to: '/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { to: '/assessment', icon: ClipboardDocumentListIcon, label: 'Health Assessment' },
  { to: '/reports', icon: DocumentTextIcon, label: 'My Reports' },
  { to: '/period', icon: CalendarDaysIcon, label: 'Period Tracker' },
  { to: '/appointments', icon: CalendarDaysIcon, label: 'Appointments' },
  { to: '/hospitals', icon: MapPinIcon, label: 'Find Hospitals' },
  { to: '/profile', icon: UserCircleIcon, label: 'My Profile' },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

const ThemeToggle = ({ compact = false }) => {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'light', icon: SunIcon, label: 'Light' },
    { value: 'dark', icon: MoonIcon, label: 'Dark' },
    { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
  ];

  if (compact) {
    // Cycle through modes with a single button
    const next = { light: 'dark', dark: 'system', system: 'light' };
    const Icon = options.find(o => o.value === theme)?.icon || SunIcon;
    return (
      <button
        onClick={() => setTheme(next[theme])}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-all"
        title={`Theme: ${theme}`}
        aria-label={`Switch theme (currently ${theme})`}
      >
        <Icon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            theme === value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          aria-pressed={theme === value}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-rose-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-rose rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <HeartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>CuraBreast</div>
            <div className="text-xs text-rose-500 dark:text-rose-400 font-semibold tracking-wide">AI Health Platform</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-rose-50 dark:border-gray-700">
        <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
          <div className="w-10 h-10 gradient-rose rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(user?.fullname)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{user?.fullname}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-4 mb-3">Navigation</div>
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section — theme + security + logout */}
      <div className="px-4 py-4 border-t border-rose-50 dark:border-gray-700 space-y-2">
        {/* Theme toggle */}
        <div className="px-1">
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-1.5 px-2">Appearance</div>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
          <ShieldCheckIcon className="w-4 h-4 text-green-400" />
          <span>Data encrypted & secure</span>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 dark:border-gray-700 fixed inset-y-0 left-0 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 shadow-2xl">
            <div className="flex justify-end p-4 bg-white dark:bg-gray-900">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="h-[calc(100%-64px)]">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-rose rounded-lg flex items-center justify-center">
              <HeartIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Playfair Display, serif' }}>CuraBreast AI</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-8 min-h-screen">
          {children}
        </main>
      </div>

      {/* INDU floating chatbot — lazy loaded */}
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </div>
  );
}
