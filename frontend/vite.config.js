import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // Para usar describe, test, expect sin importar
    },
  server: {  
    proxy: {
      "/inventory": {
        target: "http://localhost:5000", 
        changeOrigin: true,
        secure: false,
      },
      "/alertas": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/users": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/location": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      }
    },
    test: {
    globals: true,         // ✅ Habilita test, expect, describe, etc.
    environment: 'jsdom', }
  },
});