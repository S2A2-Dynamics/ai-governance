import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Puentea el dev server (5173) con la API Express en local (3000) sin CORS.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
