import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ToastPopup from "./components/ToastPopup";
import { useApp } from "./context/AppContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchVehiclesPage from "./pages/SearchVehiclesPage";
import ReservationPage from "./pages/ReservationPage";
import ProviderDashboardPage from "./pages/ProviderDashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
    const { toast } = useApp();

    return (
        <div className="app-shell">
            <Navbar />
            <ToastPopup toast={toast} />

            <main className="page-container">
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/search" element={<SearchVehiclesPage />} />
                    <Route path="/reserve" element={<ReservationPage />} />
                    <Route path="/provider" element={<ProviderDashboardPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;