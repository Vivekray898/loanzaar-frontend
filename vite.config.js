import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false, // Allow fallback to another port if 5173 is busy
    middlewareMode: false,
    proxy: {
      '/api': {
        target: 'https://loanzaar-react-base.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  // ✅ IMPORTANT: Ensure all routes fallback to index.html for SPA routing
  appType: 'spa'
})
