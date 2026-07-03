import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const proxyToLocalService = (port: number) => ({
  target: `http://localhost:${port}`,
  changeOrigin: true,
  secure: false,
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cada serviço expõe tudo sob /api/<service>/, então basta um prefixo
      // por serviço. O ai não precisa mais de rewrite: as rotas agora vivem
      // em /api/ai/... (antes eram servidas na raiz do FastAPI).
      '/api/auth': proxyToLocalService(8000),
      '/api/track': proxyToLocalService(8001),
      '/api/scholarship': proxyToLocalService(8002),
      '/api/ai': proxyToLocalService(8003),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
