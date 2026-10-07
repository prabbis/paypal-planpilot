import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanPilot — AI pricing & PayPal sandbox",
  description: "Generate editable app pricing with AI, review cost assumptions and create real PayPal sandbox billing plans. By Prabbis.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
