/**
 * Reserva Varde Goa - Public Enquiry Submission API Endpoint
 * Handles POST /api/enquiry with rate limiting, honeypot, atomic deduplication,
 * durable DB storage, and decoupled notification queue.
 */

const crypto = require('crypto');
const db = require('../lib/db');
const catalog = require('../brochure/catalog');

// Helper to get client IP from request
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

// Basic input sanitizer
function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// Simple email regex validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple phone regex validation (allows +, spaces, dashes, parentheses, at least 8 digits)
function isValidPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

module.exports = async function handler(req, res) {
  // CORS & method check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
  if (!db.isConfigured()) {
    return res.status(500).json({
      success: false,
      error: 'Production database is not configured. A managed PostgreSQL database (DATABASE_URL) is required.'
    });
  }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const clientIp = getClientIp(req);

    // 1. Honeypot check (Spam protection)
    if (body.website_hp || body.fax || body.url) {
      console.warn(`[Spam Blocked] Honeypot triggered from IP ${clientIp}`);
      return res.status(200).json({
        success: true,
        referenceId: 'RVG-2026-SPAM',
        message: 'Your enquiry has been received.'
      });
    }

    // 2. Cross-instance Database Rate Limiting (max 6 submissions per 10 minutes per IP)
    const rateLimitKey = `rate:enquiry:${clientIp}`;
    const rateCheck = await db.checkRateLimit(rateLimitKey, 6, 600);
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', rateCheck.resetIn);
      return res.status(429).json({
        success: false,
        error: `Too many submissions. Please wait ${rateCheck.resetIn} seconds before submitting again.`
      });
    }

    // 3. Validation
    const fullName = sanitize(body.fullName || body.name || body.full_name, 120);
    const email = sanitize(body.email, 120).toLowerCase();
    const phone = sanitize(body.phone, 30);
    const buyerType = sanitize(body.buyerType || body.buyer_type, 100);
    let estateModel = sanitize(body.estateModel || body.estate_model || body.villa_model || body.plotInterest || body.plot_interest, 100);
    const budgetRange = sanitize(body.budgetRange || body.budget_range || body.budget || body.investmentHorizon, 100);
    const cityCountry = sanitize(body.cityCountry || body.city_country || body.location, 150);
    const message = sanitize(body.message, 1500);

    if (!fullName || fullName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please provide your full name.' });
    }
    const brochure = body.source === 'estate_brochure' || body.estateId !== undefined || body.packageId !== undefined;
    let selection;
    if (brochure) {
      const model = catalog.models.find(model => model.id === body.estateId);
      const pkg = model && model.packages.find(pkg => pkg.id === body.packageId);
      if (!pkg) return res.status(400).json({ success: false, error: 'Choose an estate and package from the comparison.' });
      if (!['email', 'phone', 'whatsapp'].includes(body.contactMethod) || body.consent !== true) {
        return res.status(400).json({ success: false, error: 'Choose how we should contact you and confirm your consent.' });
      }
      if (body.displayedPrice !== undefined && body.displayedPrice !== pkg.price) {
        return res.status(409).json({ success: false, error: 'The indicative price has changed. Refresh the comparison before requesting a cost sheet.' });
      }
      estateModel = model.name;
      selection = { estateId: model.id, estateName: model.name, packageId: pkg.id, packageName: pkg.name, indicativePriceCr: pkg.price, contactMethod: body.contactMethod, consent: true };
    }
    if ((!brochure || body.contactMethod === 'email' || email) && !isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    if ((!brochure || body.contactMethod !== 'email' || phone) && !isValidPhone(phone)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid phone number with country/area code.' });
    }

    // 4. Concurrency-Safe Deduplication & Single-Transaction Storage
    const duplicateHash = db.computeDuplicateHash(email, phone, selection
      ? [selection.estateId, selection.packageId, selection.indicativePriceCr, selection.contactMethod].join('|') : estateModel);
    const enquiryId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const referenceId = db.generateReferenceId();
    const nowIso = new Date().toISOString();
    const metadata = JSON.stringify({
      ip: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown',
      referrer: req.headers['referer'] || 'Direct',
      submittedAt: nowIso,
      ...(selection ? { brochure: { ...selection, consentAt: nowIso } } : {})
    });

    const notificationId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
    const notificationRecipient = process.env.NOTIFICATION_EMAIL_TO || 'sales@bluechipagro.com';
    const notificationPayload = JSON.stringify({
      referenceId,
      enquiryId,
      fullName,
      email,
      phone,
      estateModel,
      budgetRange,
      cityCountry,
      message,
      ...(selection ? { brochure: selection } : {}),
      submittedAt: nowIso
    });

    const saveResult = await db.saveEnquiryAtomic(
      {
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
        source: brochure ? 'estate_brochure' : 'website_contact_form',
        nowIso
      },
      {
        notificationId,
        channel: 'email',
        recipient: notificationRecipient,
        subject: `New Private Estate Enquiry: ${referenceId} - ${fullName}`,
        payloadJson: notificationPayload
      },
      15 // 15-minute deduplication window
    );

    if (saveResult.isDuplicate) {
      return res.status(200).json({
        success: true,
        referenceId: saveResult.referenceId,
        isDuplicate: true,
        message: `Your enquiry (${saveResult.referenceId}) is already registered with our advisory team. An estate director will contact you directly.`
      });
    }

    console.log(`[Enquiry Queued] Ref: ${referenceId}.`);

    // 5. Confirmed Success Response
    return res.status(200).json({
      success: true,
      referenceId,
      message: 'Your enquiry has been saved. Our estate team will contact you using the details provided.'
    });

  } catch (error) {
    console.error('[Enquiry API Error]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An internal error occurred while processing your request. Please try again or contact sales@bluechipagro.com directly.'
    });
  }
};
