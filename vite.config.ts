import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7236',
        changeOrigin: true,
        secure: false, // Para aceitar certificados autoassinados
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes em chunks separados
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'ui-vendor': ['lucide-react'],
        }
      }
    },
  },
  base: './', // Para funcionar em caminhos relativos
})
