import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { PageWrapper } from "@/components/PageWrapper";
import { LiveScoreProvider } from "@/components/live/LiveScoreProvider";
import { ThemeProvider } from "@/hooks/useTheme";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fifawc2026.me"),
  title: {
    default: "FIFA World Cup 2026™ Fan Companion — Live Scores & Bracket",
    template: "%s | FIFA World Cup 2026™ Fan Companion",
  },
  description: "Follow the 104-match tournament with real-time live scores, active group standings, and dynamic knockout seeding bracket pathways.",
  keywords: ["FIFA", "World Cup 2026", "Live Scores", "Standings", "Fixtures", "Knockout Bracket", "Seeding", "Predictions", "Pick'em"],
  authors: [{ name: "FIFA Fan Network" }],
  openGraph: {
    title: "FIFA World Cup 2026™ Fan Companion — Live Scores & Bracket",
    description: "Follow the 104-match tournament with real-time live scores, active group standings, and dynamic knockout seeding bracket pathways.",
    url: "https://fifawc2026.me",
    siteName: "FIFA World Cup 2026™ Fan Companion",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FIFA World Cup 2026™ Fan Companion Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA World Cup 2026™ Fan Companion — Live Scores & Bracket",
    description: "Follow the 104-match tournament with real-time live scores, active group standings, and dynamic knockout seeding bracket pathways.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('wc2026_theme');
                  if (stored === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
        <ThemeProvider>
          <LiveScoreProvider>
            {/* Navigation Bar */}
            <NavBar />

            {/* Global Page Wrapper */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <PageWrapper>{children}</PageWrapper>
            </main>

            {/* Global Footer */}
            <Footer />
          </LiveScoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
