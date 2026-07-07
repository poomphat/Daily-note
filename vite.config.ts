import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Local dev: "/" — GitHub Pages CI sets VITE_BASE_PATH to "/<repo-name>/"
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["note.svg", "pwa-icon.svg", "pwa-maskable.svg"],
      manifest: {
        name: "Daily Program Note · บันทึกประจำวัน",
        short_name: "Daily Note",
        description: "บันทึกกิจกรรมประจำวัน กรอกง่าย เก็บเป็นรายวัน ใช้งาน offline ได้",
        lang: "th",
        theme_color: "#4f46e5",
        background_color: "#f7f6f2",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "pwa-maskable.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,woff,woff2}"],
      },
    }),
  ],
});
