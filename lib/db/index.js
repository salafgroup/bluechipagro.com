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

async function transaction(callback) {
  assertDbConnected();
  if (isPostgres) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const tx = {
        query: async (text, params = []) => {
          const res = await client.query(formatSql(text, true), params);
          return res.rows;
        },
        get: async (text, params = []) => {
          const res = await client.query(formatSql(text, true), params);
          return res.rows[0] || null;
        },
        run: async (text, params = []) => {
          const res = await client.query(formatSql(text, true), params);
          return { rowCount: res.rowCount };
        }
      };
      const result = await callback(tx);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (rbErr) {}
      throw err;
    } finally {
      client.release();
    }
  } else {
    sqliteDb.exec('BEGIN IMMEDIATE');
    try {
      const tx = {
        query: async (text, params = []) => {
          const stmt = sqliteDb.prepare(formatSql(text, false));
          return stmt.all(...params);
        },
        get: async (text, params = []) => {
          const stmt = sqliteDb.prepare(formatSql(text, false));
          return stmt.get(...params) || null;
        },
        run: async (text, params = []) => {
          const stmt = sqliteDb.prepare(formatSql(text, false));
          const info = stmt.run(...params);
          return { rowCount: info.changes };
        }
      };
      const result = await callback(tx);
      sqliteDb.exec('COMMIT');
      return result;
    } catch (err) {
      try { sqliteDb.exec('ROLLBACK'); } catch (rbErr) {}
      throw err;
    }
  }
}

async function checkRateLimit(key, maxRequests = 5, windowSeconds = 60) {
  assertDbConnected();
  const now = new Date();
  const nowIso = now.toISOString();

  return await transaction(async (tx) => {
    // Delete expired rate limits for this key
    await tx.run('DELETE FROM rate_limits WHERE rate_key = ? AND expires_at < ?', [key, nowIso]);

    const existing = await tx.get(
      'SELECT rate_key, request_count, window_start, expires_at FROM rate_limits WHERE rate_key = ?',
      [key]
    );

    if (!existing) {
      const expiresAt = new Date(now.getTime() + windowSeconds * 1000).toISOString();
      await tx.run(
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
    await tx.run('UPDATE rate_limits SET request_count = ? WHERE rate_key = ?', [updatedCount, key]);
    const resetIn = Math.max(0, Math.ceil((new Date(existing.expires_at).getTime() - now.getTime()) / 1000));
    return { allowed: true, remaining: maxRequests - updatedCount, resetIn };
  });
}

async function claimNotificationJobs(limit = 10) {
  assertDbConnected();
  const nowIso = new Date().toISOString();
  if (isPostgres) {
    const lockExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const sql = `
      UPDATE notification_queue
      SET status = 'processing', next_retry_at = $1
      WHERE id IN (
        SELECT id FROM notification_queue
        WHERE status IN ('pending', 'failed')
          AND attempts < max_attempts
          AND next_retry_at <= $2
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $3
      )
      RETURNING id, enquiry_id, channel, recipient, subject, payload_json, attempts, max_attempts;
    `;
    const res = await pgPool.query(sql, [lockExpiry, nowIso, limit]);
    return res.rows;
  } else {
    return await transaction(async (tx) => {
      const items = await tx.query(
        `SELECT id, enquiry_id, channel, recipient, subject, payload_json, attempts, max_attempts
         FROM notification_queue
         WHERE status IN ('pending', 'failed')
           AND attempts < max_attempts
           AND next_retry_at <= ?
         ORDER BY created_at ASC
         LIMIT ?`,
        [nowIso, limit]
      );
      if (items.length > 0) {
        const lockExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        for (const item of items) {
          await tx.run(
            `UPDATE notification_queue SET status = 'processing', next_retry_at = ? WHERE id = ?`,
            [lockExpiry, item.id]
          );
        }
      }
      return items;
    });
  }
}

async function saveEnquiryAtomic(enquiryData, notificationData, dedupWindowMinutes = 15) {
  assertDbConnected();
  const {
    enquiryId,
    referenceId,
    fullName,
    email,
    phone,
    buyerType,
    estateModel,
    budgetRange,
    cityCountry,
    message,
    duplicateHash,
    metadata,
    nowIso
  } = enquiryData;

  const {
    notificationId,
    channel = 'email',
    recipient,
    subject,
    payloadJson
  } = notificationData;

  return await transaction(async (tx) => {
    // 1. Clean expired dedup locks
    await tx.run('DELETE FROM enquiry_dedup_locks WHERE expires_at < ?', [nowIso]);

    // 2. Try to acquire dedup lock atomically
    const lockExpiresAt = new Date(new Date(nowIso).getTime() + dedupWindowMinutes * 60 * 1000).toISOString();
    let lockAcquired = false;

    try {
      await tx.run(
        `INSERT INTO enquiry_dedup_locks (duplicate_hash, reference_id, enquiry_id, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
        [duplicateHash, referenceId, enquiryId, nowIso, lockExpiresAt]
      );
      lockAcquired = true;
    } catch (err) {
      const isConstraint = (err.message && (err.message.includes('UNIQUE') || err.message.includes('unique'))) || err.code === '23505';
      if (!isConstraint) throw err;
      lockAcquired = false;
    }

    if (!lockAcquired) {
      const existingLock = await tx.get(
        'SELECT reference_id FROM enquiry_dedup_locks WHERE duplicate_hash = ?',
        [duplicateHash]
      );
      const existingRef = existingLock ? existingLock.reference_id : referenceId;
      return { isDuplicate: true, referenceId: existingRef };
    }

    // 3. Insert Enquiry
    await tx.run(
      `INSERT INTO enquiries (
        id, reference_id, full_name, email, phone, buyer_type,
        estate_model, budget_range, city_country, message,
        status, duplicate_hash, source, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 'website_contact_form', ?, ?, ?)`,
      [
        enquiryId, referenceId, fullName, email, phone, buyerType,
        estateModel, budgetRange, cityCountry, message,
        duplicateHash, metadata, nowIso, nowIso
      ]
    );

    // 4. Insert Notification Queue in the EXACT SAME transaction
    await tx.run(
      `INSERT INTO notification_queue (
        id, enquiry_id, channel, recipient, subject, payload_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [notificationId, enquiryId, channel, recipient, subject, payloadJson, nowIso]
    );

    return { isDuplicate: false, referenceId, enquiryId, notificationId };
  });
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
  transaction,
  checkRateLimit,
  claimNotificationJobs,
  saveEnquiryAtomic,
  generateReferenceId,
  computeDuplicateHash,
  initSchema,
  isPostgres: () => isPostgres,
  isConfigured: () => Boolean(pgPool || sqliteDb),
};
