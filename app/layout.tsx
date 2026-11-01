import type { Metadata } from "next";
import "./globals.css";
import DashboardShell from "@/components/dashboard-shell";

export const metadata: Metadata = {
  title: "PlanPilot — Pricing for apps, services & programmes",
  description: "Create clear pricing for apps, services, appointments and programmes. Choose one-time or recurring offers, assess delivery costs and refine your pricing. By Prabbis.",
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
