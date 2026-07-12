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
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/logo-habait.png" />
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
            animation: __splashBgOut 0.15s ease 2.05s forwards;
          }
          #__splash::before {
            content: '';
            position: absolute; width: 360px; height: 360px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(196,133,122,0.07) 0%, transparent 65%);
          }
          #__splash-logo {
            width: clamp(80px, 28vw, 130px);
            aspect-ratio: 483/276;
            background-image: url('/logo-habait.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
            animation: __splashIn 0.9s cubic-bezier(0.22,1,0.36,1) both,
                       __splashPulse 1.1s ease-in-out 1s infinite,
                       __splashLogoOut 0.5s ease 1.55s forwards;
          }
          #__splash-bar-wrap {
            margin-top: 20px; width: 50px; height: 1px;
            background: rgba(196,133,122,0.12);
            border-radius: 1px; overflow: hidden; position: relative;
            animation: __splashLogoOut 0.5s ease 1.55s forwards;
          }
          #__splash-bar-wrap::after {
            content: '';
            position: absolute; inset: 0;
            background: linear-gradient(to right, transparent, #C4857A 50%, transparent);
            animation: __splashBar 1.6s ease-in-out 0.5s both;
          }
          #__splash-byline {
            margin-top: 14px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 0.5rem;
            font-weight: 500;
            letter-spacing: 0.4em;
            color: rgba(196,133,122,0.5);
            text-transform: uppercase;
            animation: __splashIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both,
                       __splashLogoOut 0.5s ease 1.55s forwards;
          }
          @keyframes __splashIn {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes __splashPulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
          @keyframes __splashLogoOut {
            to { opacity: 0; }
          }
          @keyframes __splashBar {
            from { transform: translateX(-200%); }
            to   { transform: translateX(200%); }
          }
          @keyframes __splashBgOut {
            to { opacity: 0; pointer-events: none; }
          }
        ` }} />
      </head>
      <body style={{ background: "#080608" }}>
        <div id="__splash">
          <div id="__splash-logo" />
          <div id="__splash-bar-wrap" />
          <div id="__splash-byline">BY NATALIE ARTSI</div>
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
