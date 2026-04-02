import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Navbar() {
    const { currentUser, logout } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="navbar-inner">
                <div className="brand-block">
                    <h1 className="brand">Mobility Rental POC</h1>
                    <p className="subbrand">Simple web application demo</p>
                </div>

                <nav className="nav-links">
                    {!currentUser && (
                        <>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Login
                            </NavLink>

                            <NavLink
                                to="/register"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Register
                            </NavLink>
                        </>
                    )}

                    {currentUser && currentUser.role === "admin" && (
                        <>
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Admin Panel
                            </NavLink>

                            <NavLink
                                to="/analytics"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Analytics
                            </NavLink>
                        </>
                    )}

                    {currentUser && currentUser.role !== "admin" && (
                        <>
                            <NavLink
                                to="/search"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Search
                            </NavLink>

                            <NavLink
                                to="/reserve"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Reservations
                            </NavLink>

                            <NavLink
                                to="/analytics"
                                className={({ isActive }) =>
                                    isActive ? "nav-link active-link" : "nav-link"
                                }
                            >
                                Analytics
                            </NavLink>

                            {currentUser.role === "provider" && currentUser.approved && (
                                <NavLink
                                    to="/provider"
                                    className={({ isActive }) =>
                                        isActive ? "nav-link active-link" : "nav-link"
                                    }
                                >
                                    Provider Dashboard
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>

                <div className="user-box">
                    {currentUser ? (
                        <>
                            <div className="user-pill">
                                <span className="user-pill-label">Logged in as</span>
                                <strong>
                                    {currentUser.name} ({currentUser.role})
                                </strong>
                            </div>

                            <button className="small-btn danger-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="user-pill guest-pill">
                            <span className="user-pill-label">Status</span>
                            <strong>Not logged in</strong>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}