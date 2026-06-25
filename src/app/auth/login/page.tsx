"use client";
// src/app/auth/login/page.tsx — add this near the top
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Login to Your HanaReads Account",
  description: "Sign in to your HanaReads account.",
  alternates: { canonical: "/auth/login" },
};
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Log in to continue reading</p>

        <form onSubmit={submit} className={styles.form}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email" value={email} required
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password" value={password} required
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className={styles.switch}>
          Don't have an account? <Link href="/auth/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
