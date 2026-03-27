import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Landing from './pages/Landing';
import MustResolvePassword from './components/auth/MustResolvePassword';
import RoleGuard from './components/RoleGuard';
import Forbidden from './pages/Forbidden';
import WebAccessBlocked from './pages/WebAccessBlocked';
import Register from './pages/Register';
import { ROLE_IDS } from './auth/session';
import { useAppDispatch } from './store/hooks';
import { clearAuthState } from './store/slices/authSlice';
import AppErrorBoundary from './components/errors/AppErrorBoundary';
import PageSkeleton from './components/loaders/PageSkeleton';

const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const Payment = lazy(() => import('./pages/Payment'));
const Results = lazy(() => import('./pages/Results'));
const QuizCreator = lazy(() => import('./pages/QuizCreator'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PromoterDashboard = lazy(() => import('./pages/PromoterDashboard'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ProfileScreen = lazy(() => import('./pages/ProfileScreen'));
const SchoolDashboardLayout = lazy(() => import('./components/school/SchoolDashboardLayout'));
const SchoolDashboardPage = lazy(() => import('./pages/school/SchoolDashboardPage'));
const StudentsPage = lazy(() => import('./pages/school/StudentsPage'));
const SubscriptionPage = lazy(() => import('./pages/school/SubscriptionPage'));
const ForceChangePassword = lazy(() => import('./pages/ForceChangePassword'));

// Basename for React Router (no trailing slash). Required for GitHub Pages subpath.
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onForcedLogout = () => {
      dispatch(clearAuthState());
    };
    window.addEventListener('auth:logout', onForcedLogout);
    return () => window.removeEventListener('auth:logout', onForcedLogout);
  }, [dispatch]);

  return (
    <Router basename={basename}>
      <AppErrorBoundary>
        <div className="bg-green-100 shadow min-h-screen">
          <Suspense fallback={<PageSkeleton rows={8} />}>
            <MustResolvePassword>
            <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/change-password" element={<ForceChangePassword />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/profile"
            element={(
              <RoleGuard allow={[ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN, ROLE_IDS.SCHOOL, ROLE_IDS.PROMOTOR, ROLE_IDS.INFLUENCER]}>
                <ProfileScreen />
              </RoleGuard>
            )}
          />
          <Route
            path="/super-admin"
            element={(
              <RoleGuard allow={[ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN]}>
                <SuperAdminDashboard />
              </RoleGuard>
            )}
          />
          <Route
            path="/admin"
            element={(
              <RoleGuard allow={[ROLE_IDS.ADMIN, ROLE_IDS.SUPER_ADMIN]}>
                <AdminDashboard />
              </RoleGuard>
            )}
          />
          <Route
            path="/promoter"
            element={(
              <RoleGuard allow={[ROLE_IDS.PROMOTOR, ROLE_IDS.INFLUENCER]}>
                <PromoterDashboard />
              </RoleGuard>
            )}
          />
          <Route
            path="/school"
            element={(
              <RoleGuard allow={[ROLE_IDS.SCHOOL]}>
                <SchoolDashboardLayout />
              </RoleGuard>
            )}
          >
            <Route index element={<Navigate to="/school/dashboard" replace />} />
            <Route path="dashboard" element={<SchoolDashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="add-students" element={<Navigate to="/school/students" replace />} />
            <Route path="add-students/bulk-upload" element={<Navigate to="/school/students" replace />} />
            <Route path="subscription" element={<SubscriptionPage />} />
          </Route>
          <Route path="/events/:id" element={<Events />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/results" element={<Results />} />
          <Route path="/QuizCreator" element={<QuizCreator />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="/web-access-blocked" element={<WebAccessBlocked />} />
            </Routes>
            </MustResolvePassword>
          </Suspense>
        </div>
      </AppErrorBoundary>
    </Router>
  );
}

export default App;
