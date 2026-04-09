import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    localStorage.setItem("token", token);

    apiRequest("/api/auth/me", { token })
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken("");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(payload) {
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: payload
    });
  }

  async function refreshUser() {
    if (!token) return null;
    const data = await apiRequest("/api/auth/me", { token });
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshUser }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
