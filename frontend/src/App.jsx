import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AuthorityLoginPage from './pages/AuthorityLoginPage.jsx';
import AuthorityAcceptInvitePage from './pages/AuthorityAcceptInvitePage.jsx';
import CitizenDashboardPage from './pages/CitizenDashboardPage.jsx';
import ReportIssuePage from './pages/ReportIssuePage.jsx';
import ReportDetailPage from './pages/ReportDetailPage.jsx';
import PublicMapPage from './pages/PublicMapPage.jsx';
import AuthorityWorkspacePage from './pages/AuthorityWorkspacePage.jsx';
import AdminPanelPage from './pages/AdminPanelPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import PrivacyTermsPage from './pages/PrivacyTermsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Protected Route Helpers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AuthorityRoute = ({ children }) => {
  const { isAuthenticated, isAuthority, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated && isAuthority ? children : <Navigate to="/authority/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated && isAdmin ? children : <Navigate to="/authority/login" replace />;
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authority/login" element={<AuthorityLoginPage />} />
          <Route path="/authority/invitation" element={<AuthorityAcceptInvitePage />} />
          <Route path="/map" element={<PublicMapPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/privacy-terms" element={<PrivacyTermsPage />} />

          {/* Citizen Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CitizenDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />

          {/* Authority Protected Routes */}
          <Route
            path="/authority"
            element={
              <AuthorityRoute>
                <AuthorityWorkspacePage />
              </AuthorityRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanelPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
