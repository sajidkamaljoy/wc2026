import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { PageWrapper } from "@/components/PageWrapper";
import { LiveScoreProvider } from "@/components/live/LiveScoreProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FIFA World Cup 2026™ Fan Companion",
  description: "Follow the 104-match tournament with real-time live scores, active group standings, and dynamic knockout seeding bracket pathways.",
  keywords: ["FIFA", "World Cup 2026", "Live Scores", "Standings", "Fixtures", "Knockout Bracket", "Seeding"],
  authors: [{ name: "FIFA Fan Network" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950">
        <LiveScoreProvider>
          {/* Navigation Bar */}
          <NavBar />

          {/* Global Page Wrapper */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <PageWrapper>{children}</PageWrapper>
          </main>
        </LiveScoreProvider>
      </body>
    </html>
  );
}
