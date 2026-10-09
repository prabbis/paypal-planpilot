import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanPilot — Pricing plans & AI stores",
  description: "Create pricing plans and editable stores with AI. Sell services, physical products and digital downloads with PayPal sandbox checkout. By Prabbis.",
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
