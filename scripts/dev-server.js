const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.kml': 'application/vnd.google-earth.kml+xml'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // 1. API Route Dispatcher
  if (pathname.startsWith('/api/')) {
    let apiModulePath = null;
    if (pathname === '/api/enquiry' || pathname === '/api/enquiry/') {
      apiModulePath = path.join(PUBLIC_DIR, 'api', 'enquiry.js');
    } else if (pathname === '/api/auth/login' || pathname === '/api/auth/login/') {
      apiModulePath = path.join(PUBLIC_DIR, 'api', 'auth', 'login.js');
    } else if (pathname === '/api/auth/logout' || pathname === '/api/auth/logout/') {
      apiModulePath = path.join(PUBLIC_DIR, 'api', 'auth', 'logout.js');
    } else if (pathname === '/api/auth/verify' || pathname === '/api/auth/verify/') {
      apiModulePath = path.join(PUBLIC_DIR, 'api', 'auth', 'verify.js');
    } else if (pathname.startsWith('/api/crm/leads')) {
      apiModulePath = path.join(PUBLIC_DIR, 'api', 'crm', 'leads.js');
    }

    if (apiModulePath && fs.existsSync(apiModulePath)) {
      // Buffer body if POST/PATCH
      let bodyData = '';
      req.on('data', chunk => { bodyData += chunk; });
      req.on('end', async () => {
        try {
          if (bodyData) {
            try { req.body = JSON.parse(bodyData); }
            catch (e) { req.body = bodyData; }
          } else {
            req.body = {};
          }
          // Enhance res with status and json
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };
          res.send = (data) => {
            res.end(data);
            return res;
          };

          const handler = require(apiModulePath);
          await handler(req, res);
        } catch (err) {
          console.error('[API Server Error]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    } else {
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, error: 'API route not found' }));
    }
  }

  // 2. Static File Serving
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/crm') pathname = '/crm.html';

  let filePath = path.join(PUBLIC_DIR, pathname);

  // If path is a directory, check for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404 fallback
    const notFoundPath = path.join(PUBLIC_DIR, '404.html');
    if (fs.existsSync(notFoundPath)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(notFoundPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`[Dev Server] Reserva Varde Goa running at http://localhost:${PORT}`);
});
