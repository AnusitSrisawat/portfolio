import type { Metadata } from "next";
import { Prompt, Plus_Jakarta_Sans, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { getProfile } from "@/lib/data";
import { DEFAULT_COLORS } from "@/lib/theme";

const display = Prompt({ subsets: ["latin", "thai"], weight: ["600", "700", "800"], variable: "--font-prompt", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const thai = Noto_Sans_Thai({ subsets: ["thai"], variable: "--font-thai", display: "swap" });

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
    <html lang="en" style={theme} className={`${display.variable} ${jakarta.variable} ${thai.variable}`}>
      <body>{children}</body>
    </html>
  );
}
