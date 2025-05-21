import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: mode === 'development' ? {
      proxy: {
        "/inventory": {
          target: env.VITE_BACKEND_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
        "/users": {
          target: env.VITE_BACKEND_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    } : undefined,
    define: {
      'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
    },
  };
});