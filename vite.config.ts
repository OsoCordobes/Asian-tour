import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Keep heavy WebGL/map engines out of the initial bundle.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          mapbox: ['mapbox-gl'],
          motion: ['gsap', 'framer-motion', 'lenis'],
        },
      },
    },
  },
});
