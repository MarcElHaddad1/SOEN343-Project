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
            navigate("/search");
        }
    }, [currentUser, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const result = login(email, password);
        setMessage(result.message);

        if (result.success) {
            navigate("/search");
        }
    };

    return (
        <div className="card auth-card">
            <div className="card-header">
                <h2>Login</h2>
                <p className="muted">Sign in to search, reserve, and manage vehicles.</p>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
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

            <p className="muted auth-footer-text">
                No account yet? <Link to="/register">Create one here</Link>
            </p>

            <div className="demo-box">
                <strong>Demo tip:</strong> create one customer account and one provider account.
            </div>
        </div>
    );
}