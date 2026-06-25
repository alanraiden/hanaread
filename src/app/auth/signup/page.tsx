"use client";
// src/app/auth/signup/page.tsx — add this near the top
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a free HanaReads account to bookmark novels and track your reading.",
  alternates: { canonical: "/auth/signup" },
};
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setError(""); setLoading(true);
    try {
      await register(username, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Start tracking your reads</p>

        <form onSubmit={submit} className={styles.form}>
          <label className={styles.label}>Username</label>
          <input
            className={styles.input}
            type="text" value={username} required
            onChange={e => setUsername(e.target.value)}
            placeholder="yourname"
          />

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
            placeholder="min 8 characters"
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link href="/auth/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
