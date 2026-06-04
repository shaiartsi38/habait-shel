/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "i.imghippo.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // מונע טעינת האתר בתוך iframe של דומיין זר (clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // מונע מהדפדפן לנחש את סוג התוכן
          { key: "X-Content-Type-Options", value: "nosniff" },
          // מגביל מידע על ה-referrer בבקשות חיצוניות
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // מונע גישה ל-features רגישים שהאתר לא צריך
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // HTTPS בלבד ל-12 חודשים
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // מגביל מקורות לתוכן — מתיר YouTube/Vimeo/Supabase
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
