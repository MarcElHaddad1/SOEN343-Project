import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/search" className="brand">
          <span className="brand-mark">MR</span>
          <span className="brand-text">
            <strong>Mobility Rental</strong>
            <small>Premium City Fleet</small>
          </span>
        </Link>

        <nav className="nav-links">
          {!user && <NavLink to="/">Login</NavLink>}
          {!user && <NavLink to="/register">Register</NavLink>}

          {user?.role === "customer" && <NavLink to="/search">Search</NavLink>}
          {user?.role === "customer" && <NavLink to="/bookings">Bookings</NavLink>}
          {user?.role === "customer" && <NavLink to="/payments">Payments</NavLink>}
          {user?.role === "customer" && <NavLink to="/notifications">Notifications</NavLink>}
          {user?.role === "customer" && <NavLink to="/settings">Settings</NavLink>}

          {user?.role === "provider" && <NavLink to="/provider">Provider</NavLink>}
          {user?.role === "provider" && <NavLink to="/search">Search</NavLink>}
          {user?.role === "provider" && <NavLink to="/notifications">Notifications</NavLink>}
          {user?.role === "provider" && <NavLink to="/settings">Settings</NavLink>}

          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin/stats">Stats</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin/promos">Promos</NavLink>}
        </nav>

        <div className="nav-user">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode((prev) => !prev)}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          {user ? (
            <>
              <span className="user-chip">{user.name} ({user.role})</span>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <span className="user-chip">Guest</span>
          )}
        </div>
      </div>
    </header>
  );
}
