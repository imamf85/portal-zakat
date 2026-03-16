import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Zakat - Musholla Al-Hikmah",
  description: "Transparansi pengelolaan zakat fitrah Musholla Al-Hikmah",
  keywords: ["zakat", "fitrah", "musholla", "al-hikmah", "transparansi"],
  icons: {
    icon: "/logo_alhikmah.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Portal Zakat - Musholla Al-Hikmah",
    description: "Transparansi pengelolaan zakat fitrah Musholla Al-Hikmah",
    images: ["/logo_alhikmah.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
