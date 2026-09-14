import React, { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, verifySession } from "../api/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "hh_auth_user";
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // If the role's password gets changed (e.g. after a suspected leak), any
  // session already logged in under the old password gets signed out —
  // checked on load and periodically, not just at the next login attempt.
  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;
    const check = async () => {
      const stillValid = await verifySession(user.token);
      if (!cancelled && !stillValid) setUser(null);
    };
    check();
    const interval = setInterval(check, SESSION_CHECK_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    setUser(data);
    return data;
  };
  const logout = () => setUser(null);

  const hasPermission = (moduleKey, action) => {
    if (!user) return false;
    if (user.role === "Admin") return true;
    return !!user.permissions?.[moduleKey]?.[action];
  };

  return <AuthContext.Provider value={{ user, login, logout, hasPermission }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
