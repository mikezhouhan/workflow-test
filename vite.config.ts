// vite.config.ts
import { defineConfig } from "vite"
import electron from "vite-plugin-electron"
import react from "@vitejs/plugin-react"
import path from "path"
// Removed static import comment

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // main.ts
        entry: "electron/main.ts",
        vite: {
          build: {
            outDir: "dist-electron",
            sourcemap: true,
            minify: false,
            rollupOptions: {
              external: ["electron"]
            }
          }
        }
      },
      {
        // preload.ts
        entry: "electron/preload.ts",
        vite: {
          build: {
            outDir: "dist-electron",
            sourcemap: true,
            rollupOptions: {
              external: ["electron"]
            }
          }
        }
      }
    ])
    // Removed vite-plugin-static-copy configuration
  ],
  base: process.env.NODE_ENV === "production" ? "./" : "/",
  server: {
    port: 54321,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  // Removed explicit publicDir, rely on default 'public'
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})
