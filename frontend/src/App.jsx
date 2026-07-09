import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Eagerly-loaded pages (core flow)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import ReportsPage from './pages/ReportsPage';
import HospitalLocatorPage from './pages/HospitalLocatorPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAssessmentsPage from './pages/AdminAssessmentsPage';

// Lazy-loaded pages (performance)
const PeriodTrackerPage = lazy(() => import('./pages/PeriodTrackerPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Layout
import DashboardLayout from './components/ui/DashboardLayout';
import AdminLayout from './components/ui/AdminLayout';

// Spinner for lazy routes
const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent" />
  </div>
);

// Route guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><DashboardPage /></DashboardLayout></PrivateRoute>} />
            <Route path="/assessment" element={<PrivateRoute><DashboardLayout><AssessmentPage /></DashboardLayout></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><DashboardLayout><ReportsPage /></DashboardLayout></PrivateRoute>} />
            <Route path="/hospitals" element={<PrivateRoute><DashboardLayout><HospitalLocatorPage /></DashboardLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><DashboardLayout><ProfilePage /></DashboardLayout></PrivateRoute>} />
            <Route path="/appointments" element={<PrivateRoute><DashboardLayout><AppointmentsPage /></DashboardLayout></PrivateRoute>} />
            <Route path="/period" element={<PrivateRoute><DashboardLayout><PeriodTrackerPage /></DashboardLayout></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><DashboardLayout><SettingsPage /></DashboardLayout></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/assessments" element={<AdminRoute><AdminLayout><AdminAssessmentsPage /></AdminLayout></AdminRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
