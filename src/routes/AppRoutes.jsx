import React, { lazy, Suspense } from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LoadingSpinner from '../components/common/LoadingSpinner';
import PublicLayout from '../components/layout/PublicLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';

/* ===========================
   Lazy Loaded Public Pages
=========================== */

const HomePage = lazy(() => import('../pages/public/HomePage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const FacultyPage = lazy(() => import('../pages/public/FacultyPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const ResultCheckPage = lazy(() => import('../pages/public/ResultCheckPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const StudentsPage = lazy(() => import('../pages/public/StudentsPage'));

/* ===========================
   Lazy Loaded Admin Pages
=========================== */

const LoginPage = lazy(() => import('../pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));

export const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <LoadingSpinner
            size="large"
            label="Loading Government High School Kasala Portal..."
          />
        </div>
      }
    >
      <Routes>

        {/* ===========================
            Public Website
        =========================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faculty" element={<FacultyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/results" element={<ResultCheckPage />} />
          <Route path="/students" element={<StudentsPage />} />
        </Route>

        {/* ===========================
            Admin Authentication
        =========================== */}
        <Route
          path="/admin/login"
          element={<LoginPage />}
        />

        {/* Redirect /admin → Dashboard */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* ===========================
            Protected Admin Routes
        =========================== */}
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={['admin']} />}
        >
          <Route element={<AdminLayout />}>
            <Route
              path="dashboard"
              element={<DashboardPage />}
            />

            {/*
              Future Admin Pages

              <Route path="students" element={<StudentsPage />} />
              <Route path="faculty" element={<FacultyManagementPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="gallery" element={<GalleryManagementPage />} />
              <Route path="notices" element={<NoticesManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            */}
          </Route>
        </Route>

        {/* ===========================
            404 Page
        =========================== */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;