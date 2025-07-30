import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import https from 'https';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Disable Vite's own WebSocket handling to prevent conflicts
    hmr: true,
    proxy: {
      '/ai-api': {
        target: 'https://facetsdemo.console.facets.cloud',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        proxyTimeout: 30000,
        ws: true,
        agent: new https.Agent({
          keepAlive: true,
          keepAliveMsecs: 30000,
          maxSockets: 10,
          maxFreeSockets: 5
        }),
        // Disable buffering which can cause message duplication
        buffer: false,
        configure: (proxy, options) => {
          // Add cookie reading function
          const getCookie = () => {
            try {
              const cookieFile = path.join(process.cwd(), 'cookie.json');
              if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
                return cookieData.cookie || null;
              }
            } catch (err) {
              console.log('Cookie read error:', err.message);
            }
            return null;
          };

          // Handle HTTP requests
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.headers.upgrade !== 'websocket') {
              const cookie = getCookie();
              if (cookie) {
                proxyReq.setHeader('Cookie', cookie);
                console.log('✅ HTTP cookie added');
              }
            }
          });

          // Handle WebSocket upgrade - simplified approach
          proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
            console.log('🔌 WebSocket upgrade:', proxyReq.path);

            const cookie = getCookie();
            if (cookie) {
              proxyReq.setHeader('Cookie', cookie);
              console.log('✅ WS cookie added');
            }

            // Ensure single connection by setting keep-alive
            proxyReq.setHeader('Connection', 'Upgrade');
            proxyReq.setHeader('Upgrade', 'websocket');
          });

          // Minimal error handling
          proxy.on('error', (err, req, res) => {
            if (err.code !== 'ECONNRESET') {
              console.log('Proxy error:', err.message);
            }
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (proxyRes.statusCode >= 400) {
              console.log('Response status:', proxyRes.statusCode);
            }
          });
        }
      }
    }
  }
});