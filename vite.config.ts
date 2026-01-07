import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 1. Fixes path issues on deployment (Black Screen fix)
    base: './', 
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    
    plugins: [react()],
    
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    
    resolve: {
      alias: {
        // 2. Standardizes the '@' alias to the src directory
        '@': path.resolve(__dirname, './src'),
      }
    },

    build: {
      // 3. Increases the limit to remove the warning you received
      chunkSizeWarningLimit: 1600, 
    }
  };
});
