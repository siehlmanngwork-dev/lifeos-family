import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works on GitHub Pages under any repository path.
// Routing uses HashRouter, so no server-side rewrites are required.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep the Firebase SDK in its own long-lived cacheable chunk.
        manualChunks: { firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'] },
      },
    },
  },
});
