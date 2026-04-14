import type { Metadata } from "next";
import { Cormorant_Garamond, Marck_Script } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const marck = Marck_Script({
  variable: "--font-script",
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${marck.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          color: "#1b120a",
          background: "#0b0805",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
