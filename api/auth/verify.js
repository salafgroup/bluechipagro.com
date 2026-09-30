/**
 * Reserva Varde Goa - Staff Session Verification API Endpoint
 * Handles GET /api/auth/verify
 */

const auth = require('../../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  try {
    const token = auth.extractToken(req);
    if (!token) {
      return res.status(401).json({ authenticated: false, error: 'No session token provided.' });
    }

    const staffUser = await auth.verifySession(token);
    if (!staffUser) {
      return res.status(401).json({ authenticated: false, error: 'Session expired or user inactive.' });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: staffUser.staffId,
        email: staffUser.email,
        fullName: staffUser.fullName,
        role: staffUser.role
      }
    });
  } catch (error) {
    console.error('[Verify API Error]', error);
    return res.status(500).json({ authenticated: false, error: 'Session verification failed.' });
  }
};
