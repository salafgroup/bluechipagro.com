/**
 * Reserva Varde Goa - Staff Logout API Endpoint
 * Handles POST /api/auth/logout
 */

const auth = require('../../lib/auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  try {
    const token = auth.extractToken(req);
    if (token) {
      await auth.revokeSession(token);
    }

    res.setHeader('Set-Cookie', 'rvg_staff_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[Logout API Error]', error);
    return res.status(500).json({ success: false, error: 'Internal logout error.' });
  }
};
