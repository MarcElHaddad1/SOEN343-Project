import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchPage from "./pages/SearchPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import BookingsPage from "./pages/BookingsPage";
import PaymentsPage from "./pages/PaymentsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import ParkingPage from "./pages/ParkingPage";
import ParkingCheckoutSuccessPage from "./pages/ParkingCheckoutSuccessPage";
import ProviderPage from "./pages/ProviderPage";
import ProviderParkingPage from "./pages/ProviderParkingPage";
import AdminPage from "./pages/AdminPage";
import AdminStatsPage from "./pages/AdminStatsPage";
import ToastViewport from "./components/ToastViewport";
import CustomerChatWidget from "./components/CustomerChatWidget";

export default function App() {
  const { user } = useAuth();
  const defaultPath = user?.role === "admin" ? "/admin" : user?.role === "provider" ? "/provider" : "/search";

  return (
    <>
      <Navbar />
      <ToastViewport />
      <CustomerChatWidget enabled={user?.role === "customer"} />
      <Routes>
        <Route path="/" element={user ? <Navigate to={defaultPath} replace /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetailsPage /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccessPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/parking" element={<ProtectedRoute roles={["customer"]}><ParkingPage /></ProtectedRoute>} />
        <Route path="/parking/checkout/success" element={<ProtectedRoute roles={["customer"]}><ParkingCheckoutSuccessPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/provider" element={<ProtectedRoute roles={["provider"]}><ProviderPage /></ProtectedRoute>} />
        <Route path="/provider/parking" element={<ProtectedRoute roles={["provider"]}><ProviderParkingPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>} />
        <Route path="/admin/stats" element={<ProtectedRoute roles={["admin"]}><AdminStatsPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
