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
};

module.exports = nextConfig;
