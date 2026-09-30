/**
 * Reserva Varde Goa - Unified Database Client
 * Uses managed PostgreSQL in production (via DATABASE_URL / POSTGRES_URL).
 * Strict Production Enforcement: Fails loudly if database URL is missing in production.
 * Local development only: durable SQLite file in data/reserva_verde.sqlite.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let pgPool = null;
let sqliteDb = null;
const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
let isPostgres = false;
let initialized = false;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (connectionString) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  isPostgres = true;
} else if (isProd) {
  // STRICT COMPLIANCE: In production, never fall back to SQLite, memory, or ephemeral files!
  console.error('[DATABASE CRITICAL] Missing DATABASE_URL / POSTGRES_URL in production environment!');
} else {
  // Local development / testing mode only
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
 * Ensure database is connected
 */
function assertDbConnected() {
  if (!pgPool && !sqliteDb) {
    throw new Error('Database is not configured. In production, configure DATABASE_URL or POSTGRES_URL in your environment variables.');
  }
}

/**
 * Initialize schema if not present
 */
async function initSchema() {
  if (initialized) return;
  assertDbConnected();
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    if (isPostgres) {
      await pgPool.query(schemaSql);
    } else {
      sqliteDb.exec(schemaSql);
    }
  }
  initialized = true;
}

// Ensure schema runs
if (pgPool || sqliteDb) {
  initSchema().catch(err => {
    console.error('[DB Init Error]', err.message);
  });
}

function formatSql(sql, isPg) {
  if (!isPg) {
    return sql.replace(/\$\d+/g, '?');
  } else {
    let idx = 1;
    return sql.replace(/\?/g, () => `$${idx++}`);
  }
}

async function query(text, params = []) {
  assertDbConnected();
  if (isPostgres) {
    const res = await pgPool.query(formatSql(text, true), params);
    return res.rows;
  } else {
    const stmt = sqliteDb.prepare(formatSql(text, false));
    return stmt.all(...params);
  }
}

async function get(text, params = []) {
  assertDbConnected();
  if (isPostgres) {
    const res = await pgPool.query(formatSql(text, true), params);
    return res.rows[0] || null;
  } else {
    const stmt = sqliteDb.prepare(formatSql(text, false));
    return stmt.get(...params) || null;
  }
}

async function run(text, params = []) {
  assertDbConnected();
  if (isPostgres) {
    const res = await pgPool.query(formatSql(text, true), params);
    return { rowCount: res.rowCount };
  } else {
    const stmt = sqliteDb.prepare(formatSql(text, false));
    const info = stmt.run(...params);
    return { rowCount: info.changes };
  }
}

async function checkRateLimit(key, maxRequests = 5, windowSeconds = 60) {
  assertDbConnected();
  const now = new Date();
  const nowIso = now.toISOString();

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

function generateReferenceId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `RVG-${dateStr}-${rand}`;
}

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
  initSchema,
  isPostgres: () => isPostgres,
  isConfigured: () => Boolean(pgPool || sqliteDb),
};
