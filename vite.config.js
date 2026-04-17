import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // bind all interfaces — required inside Docker
    port: Number(process.env.PORT) || 3000,
    strictPort: true,      // fail fast if the chosen port is taken rather than silently using another port
    watch: {
      usePolling: true,    // inotify doesn't fire across Docker bind-mounts on Mac/Windows
      interval: 300,
    },
    hmr: {
      host: 'localhost',   // tell the browser where to connect for HMR websocket
      port: Number(process.env.PORT) || 3000,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:4001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
})
