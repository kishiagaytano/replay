import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "rePlay — Information Crisis Simulator",
  description:
    "A gamified web platform that transforms verified Philippine information crises into interactive, evidence-based simulations. Built for the UNESCO Youth Hackathon 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-storm-bg text-storm-text font-sans">
        {children}
      </body>
    </html>
  );
}
