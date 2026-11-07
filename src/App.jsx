import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ConfirmationPage = lazy(() => import('./pages/ConfirmationPage'));
const MyBookingPage = lazy(() => import('./pages/MyBookingPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminBookingsPage = lazy(() => import('./pages/AdminBookingsPage'));
const AdminCheckinPage = lazy(() => import('./pages/AdminCheckinPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminCatalogPage = lazy(() => import('./pages/AdminCatalogPage'));
const AdminMembersPage = lazy(() => import('./pages/AdminMembersPage'));
const AdminLoansPage = lazy(() => import('./pages/AdminLoansPage'));
const AdminFinesPage = lazy(() => import('./pages/AdminFinesPage'));
const AdminReportsPage = lazy(() => import('./pages/AdminReportsPage'));
const AdminLibrariansPage = lazy(() => import('./pages/AdminLibrariansPage'));
const AdminBranchesPage = lazy(() => import('./pages/AdminBranchesPage'));
const SpaceDetailPage = lazy(() => import('./pages/SpaceDetailPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
import ScrollToTop from './components/ScrollToTop';
import PageLoadingScreen from './components/PageLoadingScreen';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoadingScreen />}>
          <Routes>
            {/* Public Visitor Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/book" element={<LandingPage initialBookingOpen={true} />} />
            <Route path="/loading-preview" element={<PageLoadingScreen />} />
            <Route path="/spaces/:spaceId" element={<SpaceDetailPage />} />
            <Route path="/booking/confirmation/:id" element={<ConfirmationPage />} />
            <Route path="/my-booking" element={<MyBookingPage />} />
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Staff Authentication */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Staff Operations Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="catalog" element={<AdminCatalogPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="loans" element={<AdminLoansPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="reservations" element={<AdminBookingsPage />} />
              <Route path="fines" element={<AdminFinesPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="librarians" element={<AdminLibrariansPage />} />
              <Route path="branches" element={<AdminBranchesPage />} />
              <Route path="check-in" element={<AdminCheckinPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
