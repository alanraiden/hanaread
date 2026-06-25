import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create a Free HanaReads Account",
  description: "Create a free HanaReads account to bookmark novels and track your reading.",
  alternates: { canonical: "/auth/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
