import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  variable: "--font-ubuntu",
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReserveAI — AI voice reservations",
  description: "AI-powered voice reservation system for restaurants, clinics, and salons",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${ubuntu.variable} h-full`}>
        <body className="min-h-full flex flex-col antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
