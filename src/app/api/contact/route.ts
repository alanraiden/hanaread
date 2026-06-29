// src/app/api/contact/route.ts
//
// Receives the contact form POST, validates it, and sends an email
// via Resend. The API key lives in the RESEND_API_KEY environment
// variable — never commit it to source control.

import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Your inbox — where contact form submissions land
const TO_EMAIL = "idenwebstudio@gmail.com";

// Must be a domain you've verified in Resend, OR use onboarding@resend.dev
// while testing (Resend's sandbox sender — only delivers to your own address).
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const SUBJECT_LABELS: Record<string, string> = {
  "novel-suggestion": "Novel Suggestion",
  "translation-issue": "Translation Issue",
  "account": "Account / Login Help",
  "dmca": "Copyright / DMCA",
  "feedback": "General Feedback",
  "other": "Other",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body as {
      name: string;
      email: string;
      subject: string;
      message: string;
    };

    // ── Basic server-side validation ────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const subjectLabel = SUBJECT_LABELS[subject] ?? subject;

    // ── Send email via Resend ───────────────────────────────────────────────
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      // Reply-To lets you hit Reply in Gmail and it goes to the user, not yourself
      reply_to: `${name} <${email}>`,
      subject: `[HanaReads Contact] ${subjectLabel} — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="border-bottom: 2px solid #f472b6; padding-bottom: 0.5rem; color: #be185d;">
            New Contact Form Submission
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; width: 100px; color: #6b7280;">Name</td>
              <td style="padding: 0.5rem 0;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; color: #6b7280;">Email</td>
              <td style="padding: 0.5rem 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; color: #6b7280;">Subject</td>
              <td style="padding: 0.5rem 0;">${escapeHtml(subjectLabel)}</td>
            </tr>
          </table>
          <h3 style="margin-bottom: 0.5rem; color: #374151;">Message</h3>
          <div style="background: #f9fafb; border-left: 3px solid #f472b6; padding: 1rem 1.25rem; border-radius: 0 4px 4px 0; white-space: pre-wrap; line-height: 1.6;">
            ${escapeHtml(message)}
          </div>
          <p style="margin-top: 2rem; font-size: 0.75rem; color: #9ca3af;">
            Sent from hanareads.fun/contact
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend error]", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Contact route error]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/** Prevent XSS in the HTML email body */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
