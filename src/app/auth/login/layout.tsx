import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login to Your HanaReads Account",
  description: "Sign in to your HanaReads account.",
  alternates: { canonical: "/auth/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
