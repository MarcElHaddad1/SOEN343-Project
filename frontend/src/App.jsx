import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastViewport from "./components/ToastViewport";
import { useAuth } from "./context/AuthContext";
import AdminPage from "./pages/AdminPage";
import AdminStatsPage from "./pages/AdminStatsPage";
import AdminPromosPage from "./pages/AdminPromosPage";
import BookingsPage from "./pages/BookingsPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ProviderPage from "./pages/ProviderPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <ToastViewport />
      <Routes>
        {/* Public */}
        <Route path="/" element={user ? <Navigate to="/search" replace /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer */}
        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetailsPage /></ProtectedRoute>} />

        {/*
          Fix: /checkout/success MUST be declared before /checkout/:id.
          React Router v6+ matches routes in definition order when using
          path segments — "success" would otherwise be captured as :id.
        */}
        <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccessPage /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Provider */}
        <Route path="/provider" element={<ProtectedRoute roles={["provider"]}><ProviderPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
        <Route path="/admin/stats" element={<ProtectedRoute roles={["admin"]}><AdminStatsPage /></ProtectedRoute>} />
        <Route path="/admin/promos" element={<ProtectedRoute roles={["admin"]}><AdminPromosPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
