"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/lib/api";
import type { PublicUser } from "@/types/api";

// PublicUser from @/types/api is the canonical shape:
// { id, email, name, avatar, role, authProvider }
//
// NOTE: The old local User interface had `username` and `avatar_url` —
// those were wrong. The backend sends `name` and `avatar`. If any
// component still references user.username or user.avatar_url, rename
// those references to user.name and user.avatar respectively.

interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hr_token");
    if (!token) { setLoading(false); return; }

    // /auth/me returns AuthMeUser (full DB doc). We normalise it to
    // PublicUser so the context always holds one consistent shape.
    authApi.me()
      .then((meUser) =>
        setUser({
          id:           meUser.id ?? meUser._id,
          email:        meUser.email,
          name:         meUser.name,
          avatar:       meUser.avatar,
          role:         meUser.role,
          authProvider: meUser.authProvider,
        })
      )
      .catch(() => localStorage.removeItem("hr_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: publicUser } = await authApi.login({ email, password });
    localStorage.setItem("hr_token", token);
    setUser(publicUser);
  };

  const register = async (username: string, email: string, password: string) => {
    const { token, user: publicUser } = await authApi.register({
      name: username, // backend field is `name`
      email,
      password,
    });
    localStorage.setItem("hr_token", token);
    setUser(publicUser);
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
