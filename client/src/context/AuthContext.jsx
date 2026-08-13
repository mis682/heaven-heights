import React, { createContext, useContext, useEffect, useState } from "react";
import { loginRequest } from "../api/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "hh_auth_user";

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

  const login = async (name, role, password) => {
    const data = await loginRequest(name, role, password);
    setUser(data);
    return data;
  };
  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
