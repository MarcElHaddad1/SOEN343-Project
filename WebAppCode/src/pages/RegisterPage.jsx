import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function RegisterPage() {
    const { register, currentUser } = useApp();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
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

        const result = register(name, email, password, role);
        setMessage(result.message);

        if (result.success) {
            setTimeout(() => navigate("/"), 900);
        }
    };

    return (
        <div className="card auth-card">
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
        </div>
    );
}