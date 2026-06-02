import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ShellLayout from "@/components/layout/ShellLayout";

export const metadata: Metadata = {
  title: "הבית של המאפרים | Natalie Artzi",
  description: "פלטפורמת המאסטרקלאס המובילה לאמני איפור מקצועיים",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#080608",
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
          <ShellLayout isAdmin={true}>
            {children}
          </ShellLayout>
        </Providers>
      </body>
    </html>
  );
}
