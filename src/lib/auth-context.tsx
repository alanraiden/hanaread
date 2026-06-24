"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hr_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem("hr_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    localStorage.setItem("hr_token", token);
    setUser(user);
  };

  const register = async (username: string, email: string, password: string) => {
    const { token, user } = await authApi.register({ username, email, password });
    localStorage.setItem("hr_token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("hr_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
