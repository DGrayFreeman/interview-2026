import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// In Docker Compose the API is reachable at http://server:3000 (see
// VITE_API_PROXY in docker-compose.yml); locally it's localhost:3000.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  // `vite preview` (used in Docker) serves the built app on the same port,
  // inheriting the /api proxy above
  preview: {
    host: true,
    port: 5173,
  },
})
