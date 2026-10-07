import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanPilot — App pricing demo",
  description: "Describe an app, explore editable pricing tiers and simulate PayPal billing-plan creation. An interactive demo by Prabbis.",
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
