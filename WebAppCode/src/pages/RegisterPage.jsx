import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function RegisterPage() {
    const { register, currentUser } = useApp();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("+1");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (currentUser) {
            navigate("/search");
        }
    }, [currentUser, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const result = register(name, email, password, role, phone);
        setMessage(result.message);

        if (result.success) {
            setTimeout(() => navigate("/"), 1200);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-panel auth-panel-left">
                <div className="auth-left-content">
                    <span className="auth-eyebrow">Create your account</span>
                    <h1>Get started today</h1>
                    <p>
                        Register as a customer or provider and start using the
                        platform right away.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature-item">
                            <strong>Customers</strong>
                            <span>Browse, reserve, and manage rentals.</span>
                        </div>

                        <div className="auth-feature-item">
                            <strong>Providers</strong>
                            <span>Register first, then wait for admin approval.</span>
                        </div>

                        <div className="auth-feature-item">
                            <strong>Notifications</strong>
                            <span>Receive SMS updates and invoice emails.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-panel auth-panel-right">
                <div className="card auth-card auth-card-modern">
                    <div className="card-header">
                        <h2>Register</h2>
                        <p className="muted">Create an account to use the application.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="form-grid">
                        <input
                            className="input"
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <input
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            className="input"
                            type="text"
                            placeholder="Phone (+15141234567)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />

                        <input
                            className="input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <select
                            className="input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="customer">Customer</option>
                            <option value="provider">Provider</option>
                        </select>

                        <button className="btn primary-btn" type="submit">
                            Create Account
                        </button>
                    </form>

                    {message && <p className="message">{message}</p>}

                    {role === "provider" && (
                        <div className="warning" style={{ marginTop: "12px" }}>
                            Provider accounts require admin approval before access is granted.
                        </div>
                    )}

                    <p className="muted auth-footer-text">
                        Already have an account? <Link to="/">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}