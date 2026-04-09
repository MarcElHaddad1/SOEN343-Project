import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api/client";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "+1", password: "", role: "customer" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const logoUrl = `${API_URL}/LOGO/rental-car-3d-icon-png-download-10912136.png`;

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = await register(form);
      setMessage(data.message || "Registration successful");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-split auth-split-register">
      <section className="auth-visual auth-visual-register">
        <div className="auth-visual-overlay" />
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            <img src={logoUrl} alt="Vehicle Rental logo" />
          </div>
          <div>
            <p className="auth-kicker">Vehicle Rental</p>
            <h1>Create your rider account</h1>
          </div>
        </div>
        <p className="auth-visual-copy">
          Join a fleet built for modern city travel with trusted providers and map-accurate pickup locations.
        </p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <h2>Create Account</h2>
          <p className="auth-subtext">Register as customer or provider.</p>

          <form onSubmit={onSubmit} className="form">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={onChange} required />

            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required />

            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} required />

            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} required />

            <label>Role</label>
            <select name="role" value={form.role} onChange={onChange}>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
            </select>

            <button type="submit">Create Account</button>
          </form>

          {message && <p className="ok">{message}</p>}
          {error && <p className="error">{error}</p>}
          <p className="auth-subtext">Already have one? <Link to="/">Sign in</Link>.</p>
        </div>
      </section>
    </div>
  );
}
