import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "הבית של המאפרים",
    short_name: "המאפרות",
    description: "פלטפורמת המאסטרקלאס המובילה לאמני איפור מקצועיים",
    start_url: "/",
    display: "standalone",
    background_color: "#080608",
    theme_color: "#C4857A",
    lang: "he",
    dir: "rtl",
    icons: [
      { src: "/icon.png",       sizes: "32x32",   type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
