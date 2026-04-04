import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": "http://localhost:5258",
      "/access-requests": "http://localhost:5258",
      "/notifications": "http://localhost:5258",
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../Artifact/client'),
  },
})
