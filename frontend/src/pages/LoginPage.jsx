import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { API_URL } from "../api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const logoUrl = `${API_URL}/LOGO/rental-car-3d-icon-png-download-10912136.png`;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "provider" && data.user.rejected) {
        showToast("Provider account is rejected. Contact admin support.", "error");
        navigate("/provider");
      } else if (data.user.role === "provider" && !data.user.approved) {
        showToast("Provider account is waiting for admin approval.", "error");
        navigate("/provider");
      } else if (data.user.role === "provider") {
        showToast("Provider login successful.");
        navigate("/provider");
      } else navigate("/search");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-split">
      <section className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <img src={logoUrl} alt="Vehicle Rental logo" />
          </div>
          <div>
            <p className="auth-kicker">Vehicle Rental</p>
            <h1>Drive the city your way</h1>
          </div>
        </div>
        <p className="auth-visual-copy">
          Discover premium bikes, scooters, cars, and SUVs with map-accurate pickup points and seamless booking.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtext">Sign in to continue your rentals.</p>

          <form onSubmit={onSubmit} className="form">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type="submit">Sign In</button>
          </form>

          {error && <p className="error">{error}</p>}
          <p className="auth-subtext">No account? <Link to="/register">Create one</Link>.</p>
        </div>
      </section>
    </div>
  );
}
