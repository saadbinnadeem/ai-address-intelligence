import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
});

export const metadata: Metadata = {
  title: "AI Address Intelligence",
  description: "Stateless AI address parsing for Pakistan and India using Google Gemini"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} min-h-screen font-sans antialiased`}>
        <ToastProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
