import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://haaps.github.io/Badger/
const githubPagesBase = "/Badger/";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "pages" ? githubPagesBase : "/",
  server: {
    port: 5173,
    strictPort: true,
  },
}));
