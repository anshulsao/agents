import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

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
        timeout: 60000,
        proxyTimeout: 60000,
        ws: true,
        // Disable buffering which can cause message duplication
        buffer: false,
        // Add retry logic and better connection handling
        agent: false,
        headers: {
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=60, max=1000'
        },
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

          // Enhanced error handling and response logging
          proxy.on('error', (err, req, res) => {
            const errorCode = err.code;
            const url = req.url;
            
            // Handle different types of connection errors
            switch (errorCode) {
              case 'ECONNRESET':
                console.warn('⚠️  Connection reset by server for:', url);
                break;
              case 'ENOTFOUND':
                console.error('🚨 DNS lookup failed for:', url);
                break;
              case 'ECONNREFUSED':
                console.error('🚨 Connection refused for:', url);
                break;
              case 'ETIMEDOUT':
                console.error('🚨 Connection timeout for:', url);
                break;
              default:
                console.error('🚨 Proxy error:', err.message);
                console.error('Request URL:', url);
                console.error('Error code:', errorCode);
                console.error('Error details:', err);
            }
            
            // Try to send a proper error response if possible
            if (res && !res.headersSent) {
              try {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Proxy Error',
                  message: `Failed to connect to backend: ${err.message}`,
                  code: errorCode
                }));
              } catch (writeError) {
                console.error('Failed to write error response:', writeError);
              }
            }
          });

          // Add connection event logging
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Only log for non-WebSocket requests
            if (req.headers.upgrade !== 'websocket') {
              const cookie = getCookie();
              if (cookie) {
                proxyReq.setHeader('Cookie', cookie);
                console.log('✅ HTTP cookie added for:', req.url);
              }
              
              // Add connection keep-alive headers
              proxyReq.setHeader('Connection', 'keep-alive');
              proxyReq.setHeader('Keep-Alive', 'timeout=60, max=1000');
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

          proxy.on('proxyRes', (proxyRes, req, res) => {
            const statusCode = proxyRes.statusCode;
            const url = req.url;
            
            if (statusCode >= 400) {
              console.error(`🚨 HTTP ${statusCode} Error for ${url}`);
              console.error('Request headers:', req.headers);
              console.error('Response headers:', proxyRes.headers);
              
              // Capture response body for 500 errors
              if (statusCode === 500) {
                let body = '';
        }
      }
    }
  }
});