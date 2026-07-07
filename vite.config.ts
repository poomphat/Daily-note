import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Local dev: "/" — GitHub Pages CI sets VITE_BASE_PATH to "/<repo-name>/"
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
