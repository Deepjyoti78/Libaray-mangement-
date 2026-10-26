import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import BookingWizard from './pages/BookingWizard';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingPage from './pages/MyBookingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminCheckinPage from './pages/AdminCheckinPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminCatalogPage from './pages/AdminCatalogPage';
import AdminMembersPage from './pages/AdminMembersPage';
import AdminLoansPage from './pages/AdminLoansPage';
import AdminFinesPage from './pages/AdminFinesPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminLibrariansPage from './pages/AdminLibrariansPage';
import AdminBranchesPage from './pages/AdminBranchesPage';
import AdminLayout from './components/AdminLayout';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Visitor Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/book" element={<LandingPage initialBookingOpen={true} />} />
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
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
