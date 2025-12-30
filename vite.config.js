import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get BigCommerce store URL from environment variables or use default
const BIGCOMMERCE_STORE_URL = process.env.BIGCOMMERCE_STORE_URL || 'https://store-5o7xzmxoo0.mybigcommerce.com';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    proxy: {
      // General proxy rule for other API endpoints (non-GraphQL)
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      },
      // Proxy for GraphQL requests to BigCommerce
      '/graphql': {
        target: BIGCOMMERCE_STORE_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'installation-flow.js',
        assetFileNames: 'installation-flow.[ext]'
      }
    }
  }
})