import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

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

  // Fix: wrap each function in useCallback so their references are stable
  // and useMemo only re-runs when token/user/loading actually change.
  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: payload
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    const data = await apiRequest("/api/auth/me", { token });
    setUser(data.user);
    return data.user;
  }, [token]);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  // Fix: include all context values in deps so consumers never see stale functions
  const value = useMemo(
    () => ({ token, user, loading, login, register, logout, refreshUser }),
    [token, user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
