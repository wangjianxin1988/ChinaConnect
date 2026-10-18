import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  output: "static",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja", "ko", "zh-CN", "zh-TW", "th", "vi", "ru", "fr", "de", "ar", "fa"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    // 2026-10-18: esbuild's dependency optimizer writes to
    // node_modules/.vite/deps_temp_* and fails with "Access is denied" on this Windows
    // box (an AV/sandbox handle holds that directory), which aborted `astro build`
    // entirely. Redirect the cache to the OS temp dir — cross-platform, no repo paths.
    cacheDir: path.resolve(os.tmpdir(), "chinaconnect-vite-cache"),
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
