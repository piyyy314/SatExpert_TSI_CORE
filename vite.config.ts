import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss()
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
        dedupe: [
          'react',
          'react-dom',
          'jspdf',
          'jspdf-autotable',
          'lucide-react',
          'motion',
          'recharts'
        ]
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'jspdf',
          'jspdf-autotable',
          'lucide-react',
          'motion',
          'recharts',
          '@google/genai',
          '@noble/post-quantum',
          'dilithium-js',
          'uuid',
          'inflection'
        ],
        holdUntilCrawlEnd: true
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      }
    };
});
