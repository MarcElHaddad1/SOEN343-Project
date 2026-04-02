import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
    const { login, currentUser } = useApp();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === "admin") {
                navigate("/admin");
                return;
            }

            if (currentUser.role === "provider" && !currentUser.approved) {
                return;
            }

            navigate("/search");
        }
    }, [currentUser, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const result = login(email, password);
        setMessage(result.message);
    };

    return (
        <div className="auth-shell">
            <div className="auth-panel auth-panel-left">
                <div className="auth-left-content">
                    <span className="auth-eyebrow">Mobility Rental Platform</span>
                    <h1>Welcome back</h1>
                    <p>
                        Sign in to access vehicle search, reservations, analytics,
                        and provider tools.
                    </p>

                    <div className="auth-feature-list">
                        <div className="auth-feature-item">
                            <strong>Fast access</strong>
                            <span>Search and reserve vehicles in seconds.</span>
                        </div>

                        <div className="auth-feature-item">
                            <strong>Provider workflow</strong>
                            <span>Approved providers can manage vehicle inventory.</span>
                        </div>

                        <div className="auth-feature-item">
                            <strong>Admin control</strong>
                            <span>Review and approve provider accounts.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-panel auth-panel-right">
                <div className="card auth-card auth-card-modern">
                    <div className="card-header">
                        <h2>Login</h2>
                        <p className="muted">Enter your credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="form-grid">
                        <input
                            className="input"
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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

                        <button className="btn primary-btn" type="submit">
                            Login
                        </button>
                    </form>

                    {message && <p className="message">{message}</p>}

                    {currentUser &&
                        currentUser.role === "provider" &&
                        !currentUser.approved && (
                            <div className="warning" style={{ marginTop: "12px" }}>
                                Your provider account is waiting for admin approval.
                            </div>
                        )}

                    <p className="muted auth-footer-text">
                        No account yet? <Link to="/register">Create one here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}