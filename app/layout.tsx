import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ShellLayout from "@/components/layout/ShellLayout";
import SplashHide from "@/components/SplashHide";

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
        <style dangerouslySetInnerHTML={{ __html: `
          #__splash {
            position: fixed; inset: 0; z-index: 9999;
            background: #080608;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            animation: __splashOut 0.7s ease 1.9s forwards;
          }
          #__splash::before {
            content: '';
            position: absolute; width: 600px; height: 600px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(196,133,122,0.06) 0%, transparent 65%);
          }
          #__splash-logo {
            width: clamp(200px, 45vw, 440px);
            aspect-ratio: 483/276;
            background-image: url('/logo-habait.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
            animation: __splashIn 0.9s cubic-bezier(0.22,1,0.36,1) both;
          }
          #__splash-bar-wrap {
            margin-top: 40px; width: 80px; height: 1px;
            background: rgba(196,133,122,0.12);
            border-radius: 1px; overflow: hidden; position: relative;
          }
          #__splash-bar-wrap::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(to right, transparent, #C4857A 50%, transparent);
            animation: __splashBar 1.6s ease-in-out 0.5s both;
          }
          @keyframes __splashIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes __splashBar {
            from { transform: translateX(-200%); }
            to   { transform: translateX(200%); }
          }
          @keyframes __splashOut {
            to { opacity: 0; pointer-events: none; }
          }
        ` }} />
      </head>
      <body style={{ background: "#080608" }}>
        <div id="__splash">
          <div id="__splash-logo" />
          <div id="__splash-bar-wrap" />
        </div>
        <SplashHide />
        <Providers>
          <ShellLayout>
            {children}
          </ShellLayout>
        </Providers>
      </body>
    </html>
  );
}
