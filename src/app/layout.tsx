import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "../../public/fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "../../public/fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZeroCold by Nxt Apex — B2B Outbound & Footprint Intelligence",
  description:
    "Autonomous B2B outbound intelligence platform by Nxt Apex. Real-time DOM & Core Web Vitals auditing, BigQuery ML lead scoring, and Critic-verified 3-channel outreach.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05070b] text-slate-50 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
