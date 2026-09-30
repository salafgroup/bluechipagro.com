/**
 * Reserva Varde Goa - Unified Database Client
 * Supports PostgreSQL (via DATABASE_URL / POSTGRES_URL) and durable SQLite fallback.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let pgPool = null;
let sqliteDb = null;
let isPostgres = false;
let initialized = false;

// Resolve DB engine
if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
  const { Pool } = require('pg');
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  pgPool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost') ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  isPostgres = true;
} else {
  // Use Node.js built-in sqlite module
  const { DatabaseSync } = require('node:sqlite');
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'reserva_verde.sqlite');
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  isPostgres = false;
}

/**
 * Initialize schema if not present
 */
function initSchema() {
  if (initialized) return;
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    if (isPostgres) {
      // Execute schema statements for PostgreSQL
      // Replace SQLite-specific syntax if any
      pgPool.query(schemaSql).catch(err => {
        console.error('[DB] Error initializing Postgres schema:', err.message);
      });
    } else {
      sqliteDb.exec(schemaSql);
    }
  }
  initialized = true;
}

// Ensure schema runs
initSchema();

/**
 * Normalizes query parameter placeholders for Postgres ($1, $2) vs SQLite (?)
 */
function formatSql(sql, isPg) {
  if (!isPg) {
    // If sql has $1, $2, convert to ?
    return sql.replace(/\$\d+/g, '?');
  } else {
    // If sql has ?, convert to $1, $2...
    let idx = 1;
    return sql.replace(/\?/g, () => `$${idx++}`);
  }
}

/**
 * Execute query returning multiple rows
 */
async function query(text, params = []) {
  if (isPostgres) {
    const res = await pgPool.query(formatSql(text, true), params);
    return res.rows;
  } else {
    const stmt = sqliteDb.prepare(formatSql(text, false));
    return stmt.all(...params);
  }
}

/**
 * Execute query returning a single row
 */
async function get(text, params = []) {
  if (isPostgres) {
    const res = await pgPool.query(formatSql(text, true), params);
    return res.rows[0] || null;
  } else {
    const stmt = sqliteDb.prepare(formatSql(text, false));
    return stmt.get(...params) || null;
  }
}

/**
 * Execute statement (INSERT/UPDATE/DELETE)
 */
async function run(text, params = []) {
  if (isPostgres) {
    const res = await pgPool.query(formatSql(text, true), params);
    return { rowCount: res.rowCount };
  } else {
    const stmt = sqliteDb.prepare(formatSql(text, false));
    const info = stmt.run(...params);
    return { rowCount: info.changes };
  }
}

/**
 * Rate Limiter using durable DB table
 * @param {string} key Unique key (e.g. `rate:enquiry:${clientIp}`)
 * @param {number} maxRequests Maximum allowed requests in window
 * @param {number} windowSeconds Window duration in seconds
 * @returns {Promise<{ allowed: boolean, remaining: number, resetIn: number }>}
 */
async function checkRateLimit(key, maxRequests = 5, windowSeconds = 60) {
  const now = new Date();
  const nowIso = now.toISOString();

  // Clean expired
  await run('DELETE FROM rate_limits WHERE expires_at < ?', [nowIso]);

  const existing = await get('SELECT rate_key, request_count, window_start, expires_at FROM rate_limits WHERE rate_key = ?', [key]);

  if (!existing) {
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000).toISOString();
    await run(
      'INSERT INTO rate_limits (rate_key, request_count, window_start, expires_at) VALUES (?, 1, ?, ?)',
      [key, nowIso, expiresAt]
    );
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowSeconds };
  }

  if (existing.request_count >= maxRequests) {
    const resetIn = Math.max(0, Math.ceil((new Date(existing.expires_at).getTime() - now.getTime()) / 1000));
    return { allowed: false, remaining: 0, resetIn };
  }

  const updatedCount = existing.request_count + 1;
  await run('UPDATE rate_limits SET request_count = ? WHERE rate_key = ?', [updatedCount, key]);
  const resetIn = Math.max(0, Math.ceil((new Date(existing.expires_at).getTime() - now.getTime()) / 1000));
  return { allowed: true, remaining: maxRequests - updatedCount, resetIn };
}

/**
 * Generates an alphanumeric reference ID: RVG-YYYYMMDD-XXXX
 */
function generateReferenceId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `RVG-${dateStr}-${rand}`;
}

/**
 * Computes duplicate hash for an enquiry
 */
function computeDuplicateHash(email, phone, estateModel) {
  const normEmail = (email || '').trim().toLowerCase();
  const normPhone = (phone || '').replace(/\D/g, '');
  const normModel = (estateModel || '').trim().toLowerCase();
  return crypto.createHash('sha256').update(`${normEmail}:${normPhone}:${normModel}`).digest('hex');
}

module.exports = {
  query,
  get,
  run,
  checkRateLimit,
  generateReferenceId,
  computeDuplicateHash,
  isPostgres: () => isPostgres,
};
