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
    connectionTimeoutMillis: 10000,
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

const embeddedSchemaSql = require('./schema');
let initPromise = null;

/**
 * Initialize schema if not present, safely serialized across concurrent calls
 */
async function ensureSchema() {
  if (initialized) return;
  assertDbConnected();
  if (!initPromise) {
    initPromise = (async () => {
      if (isPostgres) {
        await pgPool.query(embeddedSchemaSql);
        await pgPool.query(`
          ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS claim_token TEXT;
          ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS claim_expires_at TEXT;
          ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS provider_message_id TEXT;
        `);
      } else {
        sqliteDb.exec(embeddedSchemaSql);
        try { sqliteDb.exec('ALTER TABLE notification_queue ADD COLUMN claim_token TEXT;'); } catch (e) {}
        try { sqliteDb.exec('ALTER TABLE notification_queue ADD COLUMN claim_expires_at TEXT;'); } catch (e) {}
        try { sqliteDb.exec('ALTER TABLE notification_queue ADD COLUMN provider_message_id TEXT;'); } catch (e) {}
      }
      initialized = true;
    })();
  }
  return initPromise;
}

async function initSchema() {
  return ensureSchema();
}

// Background warmup attempt
if (pgPool || sqliteDb) {
  ensureSchema().catch(err => {
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
  await ensureSchema();
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
  await ensureSchema();
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
  await ensureSchema();
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
  await ensureSchema();
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
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000).toISOString();

  // Single-statement atomic upsert handles counter increment, new counters, and expired resets in a single query
  const upsertSql = `
    INSERT INTO rate_limits (rate_key, request_count, window_start, expires_at)
    VALUES (?, 1, ?, ?)
    ON CONFLICT (rate_key) DO UPDATE
    SET request_count = CASE
          WHEN rate_limits.expires_at < EXCLUDED.window_start THEN 1
          ELSE rate_limits.request_count + 1
        END,
        window_start = CASE
          WHEN rate_limits.expires_at < EXCLUDED.window_start THEN EXCLUDED.window_start
          ELSE rate_limits.window_start
        END,
        expires_at = CASE
          WHEN rate_limits.expires_at < EXCLUDED.window_start THEN EXCLUDED.expires_at
          ELSE rate_limits.expires_at
        END
    RETURNING request_count, expires_at;
  `;

  const row = await get(upsertSql, [key, nowIso, expiresAt]);
  const count = Number(row.request_count);
  const resetIn = Math.max(0, Math.ceil((new Date(row.expires_at).getTime() - now.getTime()) / 1000));

  if (count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining: maxRequests - count, resetIn };
}

async function claimNotificationJobs(limit = 10, claimTtlSeconds = 300) {
  assertDbConnected();
  await ensureSchema();
  const now = new Date();
  const nowIso = now.toISOString();
  const claimToken = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const claimExpiresAt = new Date(now.getTime() + claimTtlSeconds * 1000).toISOString();

  if (isPostgres) {
    // Atomically claim pending/failed jobs OR expired processing jobs (worker crash recovery)
    // Uses CTE with FOR UPDATE SKIP LOCKED to guarantee instantaneous atomic claiming with zero lock contention
    const sql = `
      WITH claimable AS (
        SELECT id FROM notification_queue
        WHERE ((status IN ('pending', 'failed') AND next_retry_at <= $3)
           OR (status = 'processing' AND claim_expires_at <= $3))
          AND attempts < max_attempts
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT $4
      )
      UPDATE notification_queue n
      SET status = 'processing',
          claim_token = $1,
          claim_expires_at = $2
      FROM claimable
      WHERE n.id = claimable.id
      RETURNING n.id, n.enquiry_id, n.channel, n.recipient, n.subject, n.payload_json, n.attempts, n.max_attempts, n.claim_token;
    `;
    const res = await pgPool.query(sql, [claimToken, claimExpiresAt, nowIso, limit]);
    const jobList = res.rows;
    jobList.claimToken = claimToken;
    jobList.jobs = jobList;
    return jobList;
  } else {
    return await transaction(async (tx) => {
      const items = await tx.query(
        `SELECT id, enquiry_id, channel, recipient, subject, payload_json, attempts, max_attempts
         FROM notification_queue
         WHERE ((status IN ('pending', 'failed') AND next_retry_at <= ?)
            OR (status = 'processing' AND claim_expires_at <= ?))
           AND attempts < max_attempts
         ORDER BY created_at ASC
         LIMIT ?`,
        [nowIso, nowIso, limit]
      );
      if (items.length > 0) {
        for (const item of items) {
          await tx.run(
            `UPDATE notification_queue
             SET status = 'processing', claim_token = ?, claim_expires_at = ?
             WHERE id = ?`,
            [claimToken, claimExpiresAt, item.id]
          );
        }
      }
      const jobList = items.map(it => ({ ...it, claim_token: claimToken }));
      jobList.claimToken = claimToken;
      jobList.jobs = jobList;
      return jobList;
    });
  }
}

async function finalizeNotificationJob(jobId, claimToken, isSuccess, details = {}) {
  assertDbConnected();
  const nowIso = new Date().toISOString();
  const { errorMsg, maxAttempts = 5, attempts = 1, providerMessageId = null } = details;

  if (isSuccess) {
    // Safe finalization with ownership token check: Old worker never overwrites newer worker
    const res = await run(
      `UPDATE notification_queue
       SET status = 'sent',
           sent_at = ?,
           attempts = ?,
           last_error = NULL,
           provider_message_id = COALESCE(?, provider_message_id),
           claim_token = NULL,
           claim_expires_at = NULL
       WHERE id = ? AND claim_token = ?`,
      [nowIso, attempts, providerMessageId, jobId, claimToken]
    );
    return { finalized: res.rowCount > 0, reason: res.rowCount > 0 ? 'SUCCESS' : 'CLAIM_LOST' };
  } else {
    const backoffMinutes = Math.min(60, Math.pow(2, attempts) * 3);
    const nextRetryIso = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
    const finalStatus = attempts >= maxAttempts ? 'dead_letter' : 'failed';

    const res = await run(
      `UPDATE notification_queue
       SET status = ?,
           attempts = ?,
           last_error = ?,
           next_retry_at = ?,
           claim_token = NULL,
           claim_expires_at = NULL
       WHERE id = ? AND claim_token = ?`,
      [finalStatus, attempts, errorMsg, nextRetryIso, jobId, claimToken]
    );
    return {
      finalized: res.rowCount > 0,
      status: finalStatus,
      nextRetryAt: nextRetryIso,
      reason: res.rowCount > 0 ? 'RECORDED' : 'CLAIM_LOST'
    };
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

    // 2. Acquire dedup lock atomically via ON CONFLICT DO NOTHING RETURNING
    // This NEVER throws an error in PostgreSQL and NEVER aborts the transaction
    const lockExpiresAt = new Date(new Date(nowIso).getTime() + dedupWindowMinutes * 60 * 1000).toISOString();
    const insertLockSql = `
      INSERT INTO enquiry_dedup_locks (duplicate_hash, reference_id, enquiry_id, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (duplicate_hash) DO NOTHING
      RETURNING reference_id;
    `;
    const lockRows = await tx.query(insertLockSql, [duplicateHash, referenceId, enquiryId, nowIso, lockExpiresAt]);

    if (!lockRows || lockRows.length === 0) {
      // Duplicate conflict cleanly detected without transaction abort!
      const existingLock = await tx.get(
        'SELECT reference_id FROM enquiry_dedup_locks WHERE duplicate_hash = ?',
        [duplicateHash]
      );
      if (existingLock && existingLock.reference_id) {
        return { isDuplicate: true, referenceId: existingLock.reference_id };
      }
      const existingEnquiry = await tx.get(
        'SELECT reference_id FROM enquiries WHERE duplicate_hash = ? ORDER BY created_at DESC LIMIT 1',
        [duplicateHash]
      );
      const existingRef = existingEnquiry ? existingEnquiry.reference_id : referenceId;
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
  finalizeNotificationJob,
  saveEnquiryAtomic,
  generateReferenceId,
  computeDuplicateHash,
  initSchema,
  isPostgres: () => isPostgres,
  isConfigured: () => Boolean(pgPool || sqliteDb),
};
