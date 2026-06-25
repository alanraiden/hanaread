"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../static-page.module.css";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace with your real form endpoint (e.g. Formspree, your own API route, etc.)
    setSent(true);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.heroEyebrow}>Get in touch</p>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSub}>
            Questions, feedback, novel suggestions, or anything else — we read every message and reply as quickly as we can.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          {/* Contact form */}
          <section className={styles.prose}>
            {sent ? (
              <div style={{ padding: "2rem 0" }}>
                <p style={{ fontSize: 28, marginBottom: 12 }}>🌸</p>
                <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Message sent!</h2>
                <p>Thanks for reaching out. We&rsquo;ll get back to you at <strong>{form.email}</strong> within 1–2 business days.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className={styles.submitBtn}
                  style={{ marginTop: "1.25rem" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={styles.input}
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    className={styles.input}
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a topic…</option>
                    <option value="novel-suggestion">Novel suggestion</option>
                    <option value="translation-issue">Translation issue</option>
                    <option value="account">Account / login help</option>
                    <option value="dmca">Copyright / DMCA</option>
                    <option value="feedback">General feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className={styles.textarea}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>Send message →</button>
              </form>
            )}
          </section>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Response time</p>
              <p className={styles.cardText}>
                We typically reply within <strong style={{ color: "var(--text-primary)" }}>1–2 business days</strong>. For urgent copyright matters we aim to respond within 24 hours.
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Suggest a novel</p>
              <p className={styles.cardText}>
                Know a Korean romance we haven&rsquo;t covered yet? Use the contact form and select <em>Novel suggestion</em> — we love new recommendations.
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Copyright concerns</p>
              <p className={styles.cardText}>
                If you are a rights holder and have concerns about content on this platform, please contact us and select <em>Copyright / DMCA</em> as the subject.
              </p>
              <p className={styles.cardText} style={{ marginTop: "0.5rem" }}>
                We take these matters seriously and will respond promptly.
              </p>
            </div>

            <div className={styles.card}>
              <p className={styles.cardTitle}>Other pages</p>
              <Link href="/about" className={styles.cardLink}>→ About Us</Link>
              <Link href="/privacy" className={styles.cardLink}>→ Privacy Policy</Link>
              <Link href="/terms" className={styles.cardLink}>→ Terms of Service</Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
