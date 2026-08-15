import type { Metadata } from "next";
import localFont from "next/font/local";

import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";
import { siteUrl } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteDescription =
  "Interactive materials science lessons and visualization tools — from crystal structures to phase diagrams.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MaterialScope",
    template: "%s · MaterialScope",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MaterialScope",
    title: {
      default: "MaterialScope",
      template: "%s · MaterialScope",
    },
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: {
      default: "MaterialScope",
      template: "%s · MaterialScope",
    },
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * suppressHydrationWarning: the theme init script below toggles the
     * `dark` class on <html> before hydration, so React must not diff it.
     */
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
