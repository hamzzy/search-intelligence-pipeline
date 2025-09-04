import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/v1': {
        target: 'http://api:3000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://api:3000',
        changeOrigin: true,
      },
      '/readyz': {
        target: 'http://api:3000',
        changeOrigin: true,
      },
      '/metrics': {
        target: 'http://api:3000',
        changeOrigin: true,
      }
    }
  }
})
