/**
 * Reserva Varde Goa - Origin Verification & CSRF Protection
 */

const ALLOWED_ORIGINS = [
  'https://bluechipagro.com',
  'https://www.bluechipagro.com',
  'https://reserva-varde-goa.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function applyCors(req, res, allowedMethods = 'GET, POST, OPTIONS') {
  const origin = req.headers['origin'] || req.headers['Origin'];
  
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // Same-origin or server-to-server request
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', allowedMethods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

module.exports = {
  applyCors,
  ALLOWED_ORIGINS
};
