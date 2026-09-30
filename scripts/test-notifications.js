/**
 * Test Suite: Notification Queue Processing & Retry Verification
 */

const db = require('../lib/db');
const cronWorker = require('../api/cron/process-notifications');

function createMockReqRes({ headers = {} } = {}) {
  let statusCode = 200;
  let responseData = null;
  return {
    req: { method: 'GET', headers, url: '/api/cron/process-notifications' },
    res: {
      status(c) { statusCode = c; return this; },
      json(d) { responseData = d; return this; }
    },
    getResult: () => ({ statusCode, responseData })
  };
}

async function run() {
  console.log('=== Testing Notification Queue & Worker ===');

  // 1. Verify CRON_SECRET Protection
  process.env.NODE_ENV = 'production';
  process.env.CRON_SECRET = 'test_cron_secret_12345';
  
  console.log('\n1. Testing Unauthorized Worker Invocation (Missing Secret)...');
  const t1 = createMockReqRes({ headers: {} });
  await cronWorker(t1.req, t1.res);
  const r1 = t1.getResult();
  console.log('Status:', r1.statusCode, 'Error:', r1.responseData.error);
  if (r1.statusCode !== 401) throw new Error('Worker allowed unauthorized invocation!');

  console.log('\n2. Testing Authorized Worker Invocation with Retry Handling...');
  // Queue a test notification
  const notifId = 'test-notif-' + Date.now();
  const testEnquiryId = 'test-enq-' + Date.now();
  const nowIso = new Date().toISOString();

  // Create an enquiry first
  await db.run(
    `INSERT INTO enquiries (id, reference_id, full_name, email, phone, status, duplicate_hash, source, created_at, updated_at)
     VALUES (?, ?, 'Test Buyer', 'test@example.com', '9820000000', 'new', 'hash-123', 'test', ?, ?)`,
    [testEnquiryId, 'RVG-TEST-001', nowIso, nowIso]
  );

  await db.run(
    `INSERT INTO notification_queue (id, enquiry_id, channel, recipient, subject, payload_json, status, attempts, next_retry_at, created_at)
     VALUES (?, ?, 'email', 'sales@bluechipagro.com', 'New Enquiry', '{"referenceId":"RVG-TEST-001","fullName":"Test Buyer"}', 'pending', 0, ?, ?)`,
    [notifId, testEnquiryId, nowIso, nowIso]
  );

  // Invoke worker with valid secret (no provider configured yet)
  const t2 = createMockReqRes({ headers: { authorization: 'Bearer test_cron_secret_12345' } });
  await cronWorker(t2.req, t2.res);
  const r2 = t2.getResult();
  console.log('Worker Result:', r2.responseData);

  // Inspect DB state of the notification
  const updatedNotif = await db.get('SELECT * FROM notification_queue WHERE id = ?', [notifId]);
  console.log('Notification State after Attempt 1:', {
    status: updatedNotif.status,
    attempts: updatedNotif.attempts,
    last_error: updatedNotif.last_error,
    next_retry_at: updatedNotif.next_retry_at
  });

  if (updatedNotif.attempts !== 1 || updatedNotif.status !== 'failed') {
    throw new Error('Notification failure was not properly recorded!');
  }

  // Verify that the enquiry was NOT duplicated!
  const enquiryCount = await db.get('SELECT COUNT(*) as count FROM enquiries WHERE id = ?', [testEnquiryId]);
  console.log('Enquiry Record Count in DB (should be exactly 1):', enquiryCount.count);
  if (Number(enquiryCount.count) !== 1) throw new Error('Retry created duplicate enquiry records!');

  // Test successful delivery with webhook transport
  console.log('\n3. Testing Successful Notification Dispatch via Webhook...');
  // Configure mock webhook
  process.env.NOTIFICATION_WEBHOOK_URL = 'https://httpbin.org/post';
  // Reset notification next_retry_at to now
  await db.run('UPDATE notification_queue SET next_retry_at = ? WHERE id = ?', [new Date().toISOString(), notifId]);

  const t3 = createMockReqRes({ headers: { authorization: 'Bearer test_cron_secret_12345' } });
  await cronWorker(t3.req, t3.res);
  const r3 = t3.getResult();
  console.log('Worker Result with Webhook:', r3.responseData);

  const sentNotif = await db.get('SELECT * FROM notification_queue WHERE id = ?', [notifId]);
  console.log('Notification State after Webhook Delivery:', {
    status: sentNotif.status,
    attempts: sentNotif.attempts,
    sent_at: sentNotif.sent_at
  });

  if (sentNotif.status !== 'sent' || !sentNotif.sent_at) {
    throw new Error('Notification was not marked as sent!');
  }

  console.log('\n>>> NOTIFICATION WORKER & RETRY TESTS PASSED 100%! <<<');
  process.exit(0);
}

run().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
