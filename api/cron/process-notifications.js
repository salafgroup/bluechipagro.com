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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `Resend API failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
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
    const errText = await res.text().catch(() => '');
    throw new Error(`Webhook dispatch failed with HTTP ${res.status}: ${errText}`);
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
    // 2. Atomically claim pending/retryable jobs or expired processing claims (crash recovery)
    const claimResult = await db.claimNotificationJobs(20);
    const claimToken = claimResult.claimToken;
    const pendingItems = claimResult.jobs || claimResult;

    if (!pendingItems || pendingItems.length === 0) {
      return res.status(200).json({ success: true, processed: 0, message: 'Notification queue is empty.' });
    }

    const results = [];

    for (const item of pendingItems) {
      let payload = {};
      try { payload = JSON.parse(item.payload_json); } catch (e) {}

      const attemptNum = item.attempts + 1;
      let isSuccess = false;
      let errorMsg = null;
      let providerMessageId = null;

      // Stable idempotency key per notification across retries (retention window aware)
      const idempotencyKey = `rvg-notif-${item.id}`;

      try {
        if (process.env.RESEND_API_KEY) {
          const configuredSender = process.env.NOTIFICATION_EMAIL_FROM || process.env.NOTIFICATION_FROM_EMAIL;
          const fallbackSender = 'Reserva Verde Goa <onboarding@resend.dev>';
          let activeSender = configuredSender || fallbackSender;
          let targetRecipient = process.env.NOTIFICATION_EMAIL_TO || item.recipient || 'sales@bluechipagro.com';

          const htmlContent = `
            <h2>New Private Estate Enquiry</h2>
            <p><strong>Reference:</strong> ${payload.referenceId || ''}</p>
            <p><strong>Name:</strong> ${payload.fullName || ''}</p>
            <p><strong>Email:</strong> ${payload.email || ''}</p>
            <p><strong>Phone:</strong> ${payload.phone || ''}</p>
            <p><strong>Model:</strong> ${payload.estateModel || 'Not Specified'}</p>
            <p><strong>Budget:</strong> ${payload.budgetRange || 'Not Specified'}</p>
            <p><strong>City/Country:</strong> ${payload.cityCountry || 'Not Specified'}</p>
            <p><strong>Message:</strong> ${payload.message || 'None'}</p>
          `;
          const textContent = `New Enquiry ${payload.referenceId || ''} from ${payload.fullName || ''} (${payload.phone || ''}, ${payload.email || ''})`;

          let resendResponse = null;
          try {
            resendResponse = await sendViaResend(process.env.RESEND_API_KEY, {
              from: activeSender,
              to: targetRecipient,
              subject: item.subject,
              html: htmlContent,
              text: textContent,
              idempotencyKey
            });
          } catch (sendErr) {
            // Check if failure is due to unverified sender domain or trial authorization
            const isSenderAuthError = sendErr.status === 403 ||
              sendErr.status === 422 ||
              /domain|verify|verified|authorized|authorization|validation/i.test(sendErr.message || '');

            if (configuredSender && activeSender !== fallbackSender && isSenderAuthError) {
              console.warn(`[Notification Warning] Sender "${configuredSender}" failed authorization: ${sendErr.message}. Automatically falling back to verified sender: ${fallbackSender}`);
              activeSender = fallbackSender;

              // If Resend trial restricts destination to owner email
              if (/testing emails/i.test(sendErr.message || '') && process.env.NOTIFICATION_EMAIL_TO) {
                targetRecipient = process.env.NOTIFICATION_EMAIL_TO;
              }

              resendResponse = await sendViaResend(process.env.RESEND_API_KEY, {
                from: fallbackSender,
                to: targetRecipient,
                subject: item.subject,
                html: htmlContent,
                text: textContent,
                idempotencyKey
              });
            } else {
              throw sendErr;
            }
          }

          providerMessageId = resendResponse ? resendResponse.id : null;
          isSuccess = true;
        } else if (process.env.NOTIFICATION_WEBHOOK_URL) {
          await sendViaWebhook(process.env.NOTIFICATION_WEBHOOK_URL, {
            event: 'new_enquiry',
            enquiryId: item.enquiry_id,
            idempotencyKey,
            ...payload
          });
          providerMessageId = 'webhook-' + Date.now();
          isSuccess = true;
        } else {
          throw new Error('No notification transport configured. Configure RESEND_API_KEY or NOTIFICATION_WEBHOOK_URL.');
        }
      } catch (err) {
        errorMsg = err.message;
        isSuccess = false;
      }

      // Safe finalization with ownership token check: Old worker never overwrites newer worker
      const itemClaimToken = item.claim_token || claimToken;
      const finalizeResult = await db.finalizeNotificationJob(item.id, itemClaimToken, isSuccess, {
        attempts: attemptNum,
        maxAttempts: item.max_attempts,
        errorMsg,
        providerMessageId
      });

      results.push({
        id: item.id,
        status: isSuccess ? 'sent' : (attemptNum >= item.max_attempts ? 'dead_letter' : 'failed'),
        attempts: attemptNum,
        finalized: finalizeResult.finalized,
        reason: finalizeResult.reason,
        providerMessageId,
        error: errorMsg
      });
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
