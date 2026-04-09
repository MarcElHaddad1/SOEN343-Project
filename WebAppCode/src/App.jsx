import { useEffect } from "react";
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
import AdminPage from "./pages/AdminPage";

function App() {
    const { toast } = useApp();

    useEffect(() => {
        const existingScript = document.getElementById("tawk-script");

        if (existingScript) return;

        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        s1.async = true;
        s1.src = "https://embed.tawk.to/69ceb410b2f8a31c44a28829/1jl7munoo";
        s1.charset = "UTF-8";
        s1.setAttribute("crossorigin", "*");
        s1.id = "tawk-script";

        if (s0?.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        } else {
            document.body.appendChild(s1);
        }
    }, []);

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
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;