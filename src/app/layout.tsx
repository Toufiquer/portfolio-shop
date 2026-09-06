/*
|-----------------------------------------
| setting up layout.tsx for the App
| @author: Toufiquer Rahman<toufiquer.0@gmail.com>
| @copyright: Toufiquer, 14 August 2026
|-----------------------------------------
*/

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConfirmDeleteProvider } from "@/components/confirm-delete-provider";
import Footer from "@/components/footer/Footer";
import { Menu } from "@/components/menu/Menu";
import MobileNavigation from "@/components/MobileNavigation";
import { PublicMobileNavigationSpacing } from "@/components/PublicMobileNavigationSpacing";
import { ScrollTransition } from "@/components/ScrollTransition";
import TopBanner from "@/components/topbanner/TopBanner";
import { GlobalToast } from "@/components/ui/global-toast";
import WhatsAppButton from "@/components/whatsapp/WhatsAppButton";
import { ReduxProvider } from "@/redux/app/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "NexaMart",
    description: "NexaMart progressive web application",
    applicationName: "NexaMart",
    icons: { icon: "/Logo.png" },
    appleWebApp: { capable: true, statusBarStyle: "default", title: "NexaMart" },
    formatDetection: { telephone: false },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <ScrollTransition />
        <GlobalToast />
        <ReduxProvider>
          <ConfirmDeleteProvider>
            <TopBanner />
            <Menu />
            <PublicMobileNavigationSpacing>
              <>
                {children}
                <Footer />
              </>
            </PublicMobileNavigationSpacing>
            <WhatsAppButton />
            <MobileNavigation />
          </ConfirmDeleteProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
