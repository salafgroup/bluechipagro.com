/**
 * Reserva Varde Goa - Authentication & Authorization Module
 * Cryptographically secure password hashing (scrypt) & session management.
 */

const crypto = require('crypto');
const db = require('./db');

const SESSION_DURATION_HOURS = 24 * 7; // 7 days

/**
 * Hash password with unique salt using native scrypt
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * Verify password against stored salt and hash with timing-safe comparison
 */
function verifyPassword(password, salt, expectedHash) {
  try {
    const derivedHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(derivedHash, 'hex');
    const bufB = Buffer.from(expectedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

/**
 * Hash raw session token for database storage
 */
function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new expiring session for a staff user
 */
async function createSession(staffId, clientIp = null, userAgent = null) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashSessionToken(rawToken);
  const sessionId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  await db.run(
    `INSERT INTO staff_sessions (id, staff_id, session_token_hash, expires_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sessionId, staffId, tokenHash, expiresAt, clientIp, userAgent]
  );

  return { token: rawToken, expiresAt };
}

/**
 * Verify session token and retrieve staff user details
 */
async function verifySession(rawToken) {
  if (!rawToken || typeof rawToken !== 'string') return null;

  const tokenHash = hashSessionToken(rawToken);
  const nowIso = new Date().toISOString();

  const session = await db.get(
    `SELECT s.id as session_id, s.expires_at, u.id as staff_id, u.email, u.full_name, u.role, u.is_active
     FROM staff_sessions s
     JOIN staff_users u ON s.staff_id = u.id
     WHERE s.session_token_hash = ? AND s.expires_at > ?`,
    [tokenHash, nowIso]
  );

  if (!session) return null;
  if (!session.is_active) {
    // Revoked user; clean up session
    await db.run('DELETE FROM staff_sessions WHERE session_token_hash = ?', [tokenHash]);
    return null;
  }

  return {
    sessionId: session.session_id,
    staffId: session.staff_id,
    email: session.email,
    fullName: session.full_name,
    role: session.role,
  };
}

/**
 * Revoke specific session (logout)
 */
async function revokeSession(rawToken) {
  if (!rawToken) return;
  const tokenHash = hashSessionToken(rawToken);
  await db.run('DELETE FROM staff_sessions WHERE session_token_hash = ?', [tokenHash]);
}

/**
 * Revoke all sessions for a user (password change or access revocation)
 */
async function revokeAllUserSessions(staffId) {
  await db.run('DELETE FROM staff_sessions WHERE staff_id = ?', [staffId]);
}

/**
 * Helper to extract token from request (Bearer header or cookie)
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers['cookie'] || req.headers['Cookie'];
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, decodeURIComponent(v.join('='))];
      })
    );
    if (cookies.rvg_staff_token) {
      return cookies.rvg_staff_token;
    }
  }
  return null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  verifySession,
  revokeSession,
  revokeAllUserSessions,
  extractToken,
};
