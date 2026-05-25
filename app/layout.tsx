import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import SplashScreen from "@/components/layout/SplashScreen";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "הבית של המאפרים | Natalie Artzi",
  description: "פלטפורמת המאסטרקלאס המובילה לאמני איפור מקצועיים",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "#080608" }}>
        <Providers>
          <SplashScreen />
          <Sidebar isAdmin={true} />
          {/* No margin here — sections use sidebar-safe padding so hero bleeds full-width */}
          <main className="min-h-screen pb-24 md:pb-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
