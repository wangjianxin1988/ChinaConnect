import path from "path";
import { fileURLToPath } from "url";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: "static",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: [
      "en",
      "ja",
      "ko",
      "zh-CN",
      "zh-TW",
      "th",
      "vi",
      "ru",
      "fr",
      "de",
      "ar",
      "fa",
    ],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    ssr: {
      noExternal: [],
      external: ["leaflet", "react-leaflet", "leaflet/dist/leaflet.css"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  },
});
