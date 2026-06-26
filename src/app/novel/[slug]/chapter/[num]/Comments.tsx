'use client';

import { useEffect, useState } from 'react';
import styles from './Comments.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Comment {
  _id: string;
  guestName: string;
  content: string;
  createdAt: string;
}

interface Props {
  novelSlug: string;
  chapterNumber: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  <  7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Comments({ novelSlug, chapterNumber }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState('');
  const [text,     setText]     = useState('');
  const [error,    setError]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    fetch(`${API}/comments/${novelSlug}/${chapterNumber}`)
      .then(r => r.json())
      .then(data => { setComments(Array.isArray(data) ? data : []); })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [novelSlug, chapterNumber]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) { setError('Please enter a name.'); return; }
    if (!text.trim()) { setError('Please write a comment.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/comments/${novelSlug}/${chapterNumber}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ guestName: name, content: text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }

      setComments(prev => [data, ...prev]);
      setText('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Could not post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        Comments <span className={styles.count}>({comments.length})</span>
      </h2>

      {/* ── Post form ── */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.nameInput}
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
          disabled={submitting}
        />
        <textarea
          className={styles.textarea}
          placeholder="Share your thoughts on this chapter…"
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={1000}
          rows={3}
          disabled={submitting}
        />
        <div className={styles.formFooter}>
          {error   && <span className={styles.error}>{error}</span>}
          {success && <span className={styles.successMsg}>Comment posted!</span>}
          <button className={styles.submitBtn} type="submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>

      {/* ── Comment list ── */}
      {loading ? (
        <p className={styles.empty}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>No comments yet — be the first!</p>
      ) : (
        <ul className={styles.list}>
          {comments.map(c => (
            <li key={c._id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.author}>{c.guestName}</span>
                <span className={styles.time}>{timeAgo(c.createdAt)}</span>
              </div>
              <p className={styles.content}>{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
