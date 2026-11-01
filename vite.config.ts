import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
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
