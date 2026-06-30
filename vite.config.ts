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
      '/api/auth': proxyToLocalService(8000),
      '/api/tracks': proxyToLocalService(8001),
      '/api/modules': proxyToLocalService(8001),
      '/api/contents': proxyToLocalService(8001),
      '/api/user-tracks': proxyToLocalService(8001),
      '/api/module-progress': proxyToLocalService(8001),
      '/api/content-progress': proxyToLocalService(8001),
      '/api/submissions': proxyToLocalService(8001),
      '/api/scholarship': proxyToLocalService(8002),
      '/api/talents': proxyToLocalService(8002),
      '/api/ia': {
        ...proxyToLocalService(8003),
        rewrite: (requestPath) => requestPath.replace(/^\/api\/ia/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
