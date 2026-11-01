import type { Metadata } from "next";
import "./globals.css";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "PlanPilot — AI pricing & PayPal subscriptions",
  description: "Turn your app idea into subscription pricing with AI. Refine tiers, check margins, create PayPal billing plans and test subscription checkout. By Prabbis.",
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
      <body className="antialiased"><DashboardShell>{children}</DashboardShell></body>
    </html>
  );
}
