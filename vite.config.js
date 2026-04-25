import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Avoid CORS when calling n8n webhooks in dev
      '/n8n': {
        target: 'https://rvish.app.n8n.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/n8n/, '/webhook'),
      },
    },
  },
})
