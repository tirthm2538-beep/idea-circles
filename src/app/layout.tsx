import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Circles - Capture, Track & Share Ideas",
  description: "A space to capture your ideas, track their progress, and share them with trusted circles of friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
