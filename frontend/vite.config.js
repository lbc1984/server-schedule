import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Import plugin Vue

export default defineConfig({
  plugins: [
    vue(),
  ],
  base: '/', 
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500
  }
});