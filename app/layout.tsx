import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grane - Product Analytics & User Feedback",
  description: "Track user behavior, analyze feedback, and optimize your product with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
