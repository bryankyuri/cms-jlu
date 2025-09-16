import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow connections from any IP
    strictPort: true, // Don't try another port if 3000 is in use
    hmr: false,
    cors: true, // Enable CORS
    allowedHosts: ['https://parallelstudio.asia', 'localhost'], // Add this line
  },
  build: {
    outDir: 'dist',
  },
});