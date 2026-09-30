/**
 * Reserva Varde Goa - Protected Staff CRM Leads API Endpoint
 * Handles GET, PATCH, and POST for leads, notes, and metrics with staff attribution.
 */

const crypto = require('crypto');
const db = require('../../lib/db');
const auth = require('../../lib/auth');

// Sanitize string helper
function sanitize(str, maxLen = 1000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// Convert leads to CSV format
function toCsv(rows) {
  const headers = [
    'Reference ID', 'Date', 'Full Name', 'Email', 'Phone',
    'Estate Model', 'Buyer Type', 'Budget', 'City/Country',
    'Status', 'Assigned To', 'Follow-up Date', 'Notes Count'
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      escapeCsv(r.reference_id),
      escapeCsv(r.created_at),
      escapeCsv(r.full_name),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.estate_model || 'Not specified'),
      escapeCsv(r.buyer_type || 'General'),
      escapeCsv(r.budget_range || 'Not specified'),
      escapeCsv(r.city_country || 'Not specified'),
      escapeCsv(r.status),
      escapeCsv(r.assigned_staff_name || 'Unassigned'),
      escapeCsv(r.follow_up_date || 'None'),
      escapeCsv(r.note_count || 0)
    ].join(','));
  }

  return lines.join('\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
  if (!db.isConfigured()) {
    return res.status(500).json({
      success: false,
      error: 'Production database is not configured. A managed PostgreSQL database (DATABASE_URL) is required.'
    });
  }

    // 1. Authenticate Staff Member
    const token = auth.extractToken(req);
    const staff = await auth.verifySession(token);
    if (!staff) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid staff session required to access CRM data.'
      });
    }

    // 2. Route by HTTP Method
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const search = (url.searchParams.get('search') || '').trim();
      const statusFilter = url.searchParams.get('status') || '';
      const modelFilter = url.searchParams.get('model') || '';
      const isExport = url.searchParams.get('export') === 'csv';
      const singleLeadId = url.searchParams.get('leadId') || '';

      // If single lead requested with notes
      if (singleLeadId) {
        const lead = await db.get(
          `SELECT e.*, u.full_name as assigned_staff_name, u.email as assigned_staff_email
           FROM enquiries e
           LEFT JOIN staff_users u ON e.assigned_staff_id = u.id
           WHERE e.id = ? OR e.reference_id = ?`,
          [singleLeadId, singleLeadId]
        );

        if (!lead) {
          return res.status(404).json({ success: false, error: 'Lead not found.' });
        }

        const notes = await db.query(
          `SELECT n.id, n.content, n.note_type, n.created_at, u.full_name as author_name, u.role as author_role
           FROM enquiry_notes n
           JOIN staff_users u ON n.staff_id = u.id
           WHERE n.enquiry_id = ?
           ORDER BY n.created_at DESC`,
          [lead.id]
        );

        return res.status(200).json({ success: true, lead, notes });
      }

      // Compute Live Database KPIs
      const totalCountRow = await db.get('SELECT COUNT(*) as count FROM enquiries');
      const totalLeads = Number(totalCountRow?.count || 0);

      const statusRows = await db.query(
        'SELECT status, COUNT(*) as count FROM enquiries GROUP BY status'
      );
      const byStatus = {};
      statusRows.forEach(r => { byStatus[r.status] = Number(r.count); });

      const modelRows = await db.query(
        'SELECT estate_model, COUNT(*) as count FROM enquiries GROUP BY estate_model'
      );
      const byModel = {};
      modelRows.forEach(r => { if (r.estate_model) byModel[r.estate_model] = Number(r.count); });

      const pendingFollowUpsRow = await db.get(
        "SELECT COUNT(*) as count FROM enquiries WHERE status = 'new' OR (follow_up_date IS NOT NULL AND follow_up_date <= date('now'))"
      );
      const pendingFollowUps = Number(pendingFollowUpsRow?.count || 0);

      // Build Query for Leads
      let whereClauses = [];
      let params = [];

      if (statusFilter && statusFilter !== 'all') {
        whereClauses.push('e.status = ?');
        params.push(statusFilter);
      }
      if (modelFilter && modelFilter !== 'all') {
        whereClauses.push('e.estate_model LIKE ?');
        params.push(`%${modelFilter}%`);
      }
      if (search) {
        whereClauses.push('(e.full_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.reference_id LIKE ?)');
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const querySql = `
        SELECT e.id, e.reference_id, e.full_name, e.email, e.phone, e.buyer_type,
               e.estate_model, e.budget_range, e.city_country, e.message, e.status,
               e.assigned_staff_id, e.follow_up_date, e.created_at, e.updated_at,
               u.full_name as assigned_staff_name,
               (SELECT COUNT(*) FROM enquiry_notes WHERE enquiry_id = e.id) as note_count
        FROM enquiries e
        LEFT JOIN staff_users u ON e.assigned_staff_id = u.id
        ${whereSql}
        ORDER BY e.created_at DESC
        ${isExport ? '' : 'LIMIT 200'}
      `;

      const leads = await db.query(querySql, params);

      if (isExport) {
        const csv = toCsv(leads);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=reserva_varde_leads_${new Date().toISOString().slice(0,10)}.csv`);
        return res.status(200).send(csv);
      }

      // Fetch active staff list for reassignment options
      const staffList = await db.query(
        'SELECT id, full_name, email, role FROM staff_users WHERE is_active = 1 ORDER BY full_name ASC'
      );

      return res.status(200).json({
        success: true,
        kpi: {
          total: totalLeads,
          new: byStatus['new'] || 0,
          contacted: byStatus['contacted'] || 0,
          site_visit_scheduled: byStatus['site_visit_scheduled'] || 0,
          cost_sheet_sent: byStatus['cost_sheet_sent'] || 0,
          closed_won: byStatus['closed_won'] || 0,
          pendingFollowUps,
          byModel
        },
        leads,
        staffList
      });

    } else if (req.method === 'PATCH') {
      // Update Lead Status, Assignment, or Follow-up date
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const leadId = sanitize(body.id || body.leadId);
      if (!leadId) {
        return res.status(400).json({ success: false, error: 'Lead ID is required.' });
      }

      const existing = await db.get('SELECT * FROM enquiries WHERE id = ? OR reference_id = ?', [leadId, leadId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Lead not found.' });
      }

      const updates = [];
      const params = [];
      const auditNotes = [];

      if (body.status && body.status !== existing.status) {
        updates.push('status = ?');
        params.push(body.status);
        auditNotes.push(`Changed status from "${existing.status}" to "${body.status}"`);
      }

      if (body.assignedStaffId !== undefined && body.assignedStaffId !== existing.assigned_staff_id) {
        updates.push('assigned_staff_id = ?');
        params.push(body.assignedStaffId || null);
        if (body.assignedStaffId) {
          const assignee = await db.get('SELECT full_name FROM staff_users WHERE id = ?', [body.assignedStaffId]);
          auditNotes.push(`Reassigned to ${assignee ? assignee.full_name : body.assignedStaffId}`);
        } else {
          auditNotes.push('Removed assignment');
        }
      }

      if (body.followUpDate !== undefined && body.followUpDate !== existing.follow_up_date) {
        updates.push('follow_up_date = ?');
        params.push(body.followUpDate || null);
        auditNotes.push(`Updated follow-up date to ${body.followUpDate || 'None'}`);
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(existing.id);
        await db.run(`UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`, params);

        // Record audit notes with authenticated staff attribution
        for (const noteContent of auditNotes) {
          const noteId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
          await db.run(
            `INSERT INTO enquiry_notes (id, enquiry_id, staff_id, note_type, content)
             VALUES (?, ?, ?, 'status_change', ?)`,
            [noteId, existing.id, staff.staffId, noteContent]
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Lead updated successfully.',
        auditNotes
      });

    } else if (req.method === 'POST') {
      // Add Note to Lead
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const leadId = sanitize(body.enquiryId || body.leadId);
      const content = sanitize(body.content, 2000);
      const noteType = sanitize(body.noteType || 'comment', 50);

      if (!leadId || !content) {
        return res.status(400).json({ success: false, error: 'Lead ID and note content are required.' });
      }

      const existing = await db.get('SELECT id FROM enquiries WHERE id = ? OR reference_id = ?', [leadId, leadId]);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Lead not found.' });
      }

      const noteId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
      await db.run(
        `INSERT INTO enquiry_notes (id, enquiry_id, staff_id, note_type, content)
         VALUES (?, ?, ?, ?, ?)`,
        [noteId, existing.id, staff.staffId, noteType, content]
      );

      return res.status(200).json({
        success: true,
        message: 'Note added successfully.',
        note: {
          id: noteId,
          content,
          note_type: noteType,
          author_name: staff.fullName,
          author_role: staff.role,
          created_at: new Date().toISOString()
        }
      });
    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed.' });
    }

  } catch (error) {
    console.error('[CRM Leads API Error]', error);
    return res.status(500).json({ success: false, error: 'Internal CRM error.' });
  }
};
