import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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
import AdminLayout from './components/AdminLayout';

export default function App() {
  return (
    <AuthProvider>
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
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="check-in" element={<AdminCheckinPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="catalog" element={<Navigate to="/admin" replace />} />
            <Route path="members" element={<Navigate to="/admin" replace />} />
            <Route path="loans" element={<Navigate to="/admin" replace />} />
            <Route path="fines" element={<Navigate to="/admin" replace />} />
            <Route path="reports" element={<Navigate to="/admin" replace />} />
            <Route path="librarians" element={<Navigate to="/admin" replace />} />
            <Route path="branches" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
