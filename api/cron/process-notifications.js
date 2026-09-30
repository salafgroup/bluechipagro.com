/**
 * Reserva Varde Goa - Notification Queue Processing Worker
 * Runs as a secure background worker / cron job to dispatch pending notifications.
 * Protected by CRON_SECRET authorization.
 */

const db = require('../../lib/db');

// Helper to send email via Resend if key exists
async function sendViaResend(apiKey, { from, to, subject, html, text, idempotencyKey }) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify({ from, to, subject, html, text })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Resend API failed with status ${res.status}`);
  }
  return data;
}

// Helper to send via Webhook if configured
async function sendViaWebhook(webhookUrl, payload) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Webhook dispatch failed with HTTP ${res.status}`);
  }
  return true;
}

module.exports = async function handler(req, res) {
  // 1. Strict Authorization Gate: Reject whenever CRON_SECRET is missing or invalid
  const authHeader = req.headers['authorization'] || '';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid CRON_SECRET.'
    });
  }

  if (!db.isConfigured()) {
    return res.status(500).json({ success: false, error: 'Database not configured.' });
  }

  try {
    // 2. Atomically claim pending or retryable jobs so overlapping workers never double-process
    const pendingItems = await db.claimNotificationJobs(20);

    if (pendingItems.length === 0) {
      return res.status(200).json({ success: true, processed: 0, message: 'Notification queue is empty.' });
    }

    const results = [];

    for (const item of pendingItems) {
      let payload = {};
      try { payload = JSON.parse(item.payload_json); } catch (e) {}

      const attemptNum = item.attempts + 1;
      let isSuccess = false;
      let errorMsg = null;

      try {
        if (process.env.RESEND_API_KEY) {
          // Explicit configured sender priority, with fallback only when unset
          const fromEmail = process.env.NOTIFICATION_EMAIL_FROM || process.env.NOTIFICATION_FROM_EMAIL || 'Reserva Verde Goa <onboarding@resend.dev>';
          const targetRecipient = item.recipient || process.env.NOTIFICATION_EMAIL_TO || 'sales@bluechipagro.com';
          const idempotencyKey = `rvg-notif-${item.id}-attempt-${attemptNum}`;

          const htmlContent = `
            <h2>New Private Estate Enquiry</h2>
            <p><strong>Reference:</strong> ${payload.referenceId}</p>
            <p><strong>Name:</strong> ${payload.fullName}</p>
            <p><strong>Email:</strong> ${payload.email}</p>
            <p><strong>Phone:</strong> ${payload.phone}</p>
            <p><strong>Model:</strong> ${payload.estateModel || 'Not Specified'}</p>
            <p><strong>Budget:</strong> ${payload.budgetRange || 'Not Specified'}</p>
            <p><strong>City/Country:</strong> ${payload.cityCountry || 'Not Specified'}</p>
            <p><strong>Message:</strong> ${payload.message || 'None'}</p>
          `;
          await sendViaResend(process.env.RESEND_API_KEY, {
            from: fromEmail,
            to: targetRecipient,
            subject: item.subject,
            html: htmlContent,
            text: `New Enquiry ${payload.referenceId} from ${payload.fullName} (${payload.phone}, ${payload.email})`,
            idempotencyKey
          });
          isSuccess = true;
        } else if (process.env.NOTIFICATION_WEBHOOK_URL) {
          await sendViaWebhook(process.env.NOTIFICATION_WEBHOOK_URL, {
            event: 'new_enquiry',
            enquiryId: item.enquiry_id,
            idempotencyKey: `rvg-notif-${item.id}-attempt-${attemptNum}`,
            ...payload
          });
          isSuccess = true;
        } else {
          // No active external email transport configured in environment
          // Fail gracefully with clear diagnostic message for retry
          throw new Error('No notification transport configured. Configure RESEND_API_KEY or NOTIFICATION_WEBHOOK_URL.');
        }
      } catch (err) {
        errorMsg = err.message;
        isSuccess = false;
      }

      if (isSuccess) {
        await db.run(
          `UPDATE notification_queue
           SET status = 'sent', sent_at = ?, attempts = ?, last_error = NULL
           WHERE id = ?`,
          [new Date().toISOString(), attemptNum, item.id]
        );
        results.push({ id: item.id, status: 'sent', attempts: attemptNum });
      } else {
        // Exponential backoff retry calculation: 2^(attempts) * 3 minutes
        const backoffMinutes = Math.min(60, Math.pow(2, attemptNum) * 3);
        const nextRetryIso = new Date(Date.now() + backoffMinutes * 60 * 1000).toISOString();
        const finalStatus = attemptNum >= item.max_attempts ? 'dead_letter' : 'failed';

        await db.run(
          `UPDATE notification_queue
           SET status = ?, attempts = ?, last_error = ?, next_retry_at = ?
           WHERE id = ?`,
          [finalStatus, attemptNum, errorMsg, nextRetryIso, item.id]
        );
        results.push({ id: item.id, status: finalStatus, attempts: attemptNum, error: errorMsg, nextRetryAt: nextRetryIso });
      }
    }

    return res.status(200).json({
      success: true,
      processed: pendingItems.length,
      results
    });

  } catch (err) {
    console.error('[Notification Worker Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
