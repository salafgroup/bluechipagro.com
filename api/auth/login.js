/**
 * Reserva Varde Goa - Staff Login API Endpoint
 * Handles POST /api/auth/login
 */

const db = require('../../lib/db');
const auth = require('../../lib/auth');

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  try {
  if (!db.isConfigured()) {
    return res.status(500).json({
      success: false,
      error: 'Production database is not configured. A managed PostgreSQL database (DATABASE_URL) is required.'
    });
  }

    const clientIp = getClientIp(req);
    // Rate limit: max 5 login attempts per 10 minutes per IP
    const rateCheck = await db.checkRateLimit(`rate:login:${clientIp}`, 5, 600);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: `Too many login attempts. Please wait ${rateCheck.resetIn} seconds before trying again.`
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide both email and password.' });
    }

    const user = await db.get(
      'SELECT id, email, full_name, role, password_hash, salt, is_active FROM staff_users WHERE email = ?',
      [email]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Invalid email or password, or account is disabled.' });
    }

    const valid = auth.verifyPassword(password, user.salt, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const { token, expiresAt } = await auth.createSession(user.id, clientIp, userAgent);

    // Set secure cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieFlags = [
      `rvg_staff_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${7 * 24 * 3600}`,
      isProd ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieFlags);

    return res.status(200).json({
      success: true,
      token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('[Login API Error]', error);
    return res.status(500).json({ success: false, error: 'Internal authentication server error.' });
  }
};
