import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Shade Protocol",
  description: "Private cBTC transactions on Citrea",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen font-sans">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
