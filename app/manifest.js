import { getSiteUrl } from "../lib/seo";

export default function manifest() {
  return {
    name: "GoModexa Official Site",
    short_name: "GoModexa",
    description:
      "Official GoModexa store for curated lifestyle shopping in India.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#f8fafc",
    icons: [
      {
        src: getSiteUrl("/assets/gomodexa.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
