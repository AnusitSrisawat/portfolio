import type { Metadata } from "next";
import "./globals.css";
import { getProfile } from "@/lib/data";
import { DEFAULT_COLORS } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "My skills and the projects behind them.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Theme colors are editable in /admin; fall back to defaults if the DB is unreachable.
  const c = await getProfile().catch(() => DEFAULT_COLORS);
  const theme = {
    "--color-cream": c.colorCream,
    "--color-ink": c.colorInk,
    "--color-amber": c.colorAmber,
    "--color-amber-deep": c.colorAmberDeep,
  } as React.CSSProperties;
  return (
    <html lang="en" style={theme}>
      <body>{children}</body>
    </html>
  );
}
