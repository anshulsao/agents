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
        timeout: 30000,
        proxyTimeout: 30000,
        ws: true,
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

          // Enhanced error handling and response logging
          proxy.on('error', (err, req, res) => {
            if (err.code !== 'ECONNRESET') {
              console.error('🚨 Proxy error:', err.message);
              console.error('Request URL:', req.url);
              console.error('Error details:', err);
            }
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
                const originalWrite = res.write;
                const originalEnd = res.end;
                
                // Buffer the response body
                proxyRes.on('data', (chunk) => {
                  body += chunk.toString();
                });
                
                proxyRes.on('end', () => {
                  console.error('🔥 500 Error Response Body:');
                  console.error('=====================================');
                  try {
                    // Try to parse as JSON for better formatting
                    const jsonBody = JSON.parse(body);
                    console.error(JSON.stringify(jsonBody, null, 2));
                  } catch {
                    // If not JSON, log as plain text
                    console.error(body);
                  }
                  console.error('=====================================');
                });
              }
            } else if (statusCode >= 200 && statusCode < 300) {
              console.log(`✅ HTTP ${statusCode} Success for ${url}`);
            }
          });
        }
      }
    }
  }
});