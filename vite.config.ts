import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This ensures relative paths in build
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/ai-api': {
        target: 'https://facetsdemo.console.facets.cloud',
        changeOrigin: true, // This fixes the host header issue
        secure: false, // Disable SSL certificate validation for development
        timeout: 10000, // 10 second timeout
        proxyTimeout: 10000, // 10 second proxy timeout
        ws: true, // Enable WebSocket proxying
        configure: (proxy, options) => {
          // Handle regular HTTP requests
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const host = proxyReq.getHeader('host');
            const fullUrl = `${options.target}${proxyReq.path}`;

            console.log('HTTP Request - Host header:', host);
            console.log('Complete URL constructed:', fullUrl);

            // Add cookie for HTTP requests
            try {
              const cookieFile = path.join(process.cwd(), 'cookie.json');
              if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
                if (cookieData.cookie) {
                  proxyReq.setHeader('Cookie', cookieData.cookie);
                  console.log('✅ Added cookie to HTTP request');
                }
              } else {
                console.log('⚠️  cookie.json file not found');
              }
            } catch (err) {
              console.log('❌ Could not read cookie file:', err.message);
            }
          });

          // Handle WebSocket upgrade requests
          proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
            console.log('🔌 WebSocket upgrade request to:', proxyReq.path);

            // Add cookie for WebSocket connections
            try {
              const cookieFile = path.join(process.cwd(), 'cookie.json');
              if (fs.existsSync(cookieFile)) {
                const cookieData = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
                if (cookieData.cookie) {
                  proxyReq.setHeader('Cookie', cookieData.cookie);
                  console.log('✅ Added cookie to WebSocket upgrade request');
                }
              } else {
                console.log('⚠️  cookie.json file not found for WebSocket');
              }
            } catch (err) {
              console.log('❌ Could not read cookie file for WebSocket:', err.message);
            }
          });

          // Handle general proxy errors
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
            if (err.code === 'ECONNRESET') {
              console.log('🔄 Connection reset (this can be normal for WebSocket connections)');
            } else {
              console.log('❌ Unexpected proxy error:', err);
            }
          });

          // Handle WebSocket-specific errors
          proxy.on('wsError', (err, req, socket) => {
            console.log('WebSocket error:', err.message);
            if (err.code === 'ECONNRESET') {
              console.log('🔄 WebSocket connection reset by server');
            } else {
              console.log('❌ WebSocket error:', err);
            }
          });

          // Handle HTTP responses
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ [HTTP Response] Status:', proxyRes.statusCode);

            // Log any authentication issues
            if (proxyRes.statusCode === 401 || proxyRes.statusCode === 403) {
              console.log('🔐 Authentication failed - check your cookie');
            }

            // Handle Set-Cookie headers from target server (optional)
            const setCookies = proxyRes.headers['set-cookie'];
            if (setCookies) {
              console.log('🍪 Target server setting cookies:', setCookies);
            }
          });
        }
      }
    }
  }
});