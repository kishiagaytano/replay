import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TaskProvider } from "@/lib/store/task-store";
import { AppShell } from "@/components/layout/AppShell";
import { ContentGate } from "@/components/layout/ContentGate";
import { THEME_INIT_SCRIPT } from "@/lib/theme/theme-script";

export const metadata: Metadata = {
  title: "rePlay · Team Tracker",
  description: "Internal task tracker for the rePlay team — UNESCO Youth Hackathon 2026.",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <TaskProvider>
          <AppShell>
            <ContentGate>{children}</ContentGate>
          </AppShell>
        </TaskProvider>
      </body>
    </html>
  );
}
