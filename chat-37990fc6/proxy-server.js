import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5176;

// Serve static files from the dist folder (if built)
app.use(express.static(join(__dirname, 'dist')));

// Proxy requests to the Vite dev server for development
app.use('/journal', createProxyMiddleware({
  target: 'http://localhost:5177',
  changeOrigin: true,
  pathRewrite: {
    '^/journal': '', // remove /journal prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to target`);
  }
}));

// Also proxy root requests
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5177',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to target`);
  }
}));

app.listen(port, () => {
  console.log(`🚀 Proxy server running on http://localhost:${port}/journal`);
  console.log(`Forwarding to Vite dev server on http://localhost:5177`);
});