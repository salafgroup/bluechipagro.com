'use strict';
// Isolated integration test. No configured PostgreSQL, external transport, or
// production credentials are used. Requests use the real repository handlers.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');

async function test() {
  const initial = process.cwd();
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'rvg-brochure-test-'));
  for (const key of ['VERCEL','DATABASE_URL','POSTGRES_URL','RESEND_API_KEY','NOTIFICATION_WEBHOOK_URL']) delete process.env[key];
  process.env.NODE_ENV = 'test';
  process.env.NOTIFICATION_EMAIL_TO = 'preview-test@example.invalid';
  process.chdir(sandbox);
  const db = require('../lib/db');
  const auth = require('../lib/auth');
  const { models } = require('../brochure/catalog');
  const handlers = {
    '/api/enquiry': require('../api/enquiry'),
    '/api/auth/login': require('../api/auth/login'),
    '/api/crm/leads': require('../api/crm/leads')
  };
  const server = http.createServer(async (req, res) => {
    const handler = handlers[new URL(req.url, 'http://localhost').pathname];
    if (!handler) { res.writeHead(404).end(); return; }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    res.status = n => {res.statusCode = n; return res;};
    res.json = data => res.end(JSON.stringify(data));
    res.send = data => res.end(data);
    await handler(req,res);
  });
  try {
    assert.equal(db.isPostgres(), false);
    server.listen(0,'127.0.0.1'); await once(server,'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    const post = (route, data) => fetch(base + route, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
    const estate = models.find(m => m.id === '4bhk');
    const pkg = estate.packages[0];
    const payload = {source:'estate_brochure', fullName:'Brochure QA', contactMethod:'email', email:'buyer@example.invalid', estateId:estate.id, packageId:pkg.id, consent:true, displayedPrice:pkg.price};
    assert.equal((await post('/api/enquiry', {...payload, consent:false})).status, 400);
    assert.equal((await post('/api/enquiry', {...payload, displayedPrice:-1})).status, 409);
    const created = await (await post('/api/enquiry', payload)).json();
    assert.equal(created.success, true); assert.match(created.referenceId,/^RVG-\d{8}-[A-F0-9]{4}$/);
    const repeated = await (await post('/api/enquiry', payload)).json();
    assert.equal(repeated.referenceId, created.referenceId); assert.equal(repeated.isDuplicate, true);
    const staffId = crypto.randomUUID(), pw = crypto.randomBytes(24).toString('hex');
    const {hash,salt} = auth.hashPassword(pw);
    await db.run('INSERT INTO staff_users (id,email,full_name,role,password_hash,salt) VALUES (?,?,?,?,?,?)',[staffId,'staff@example.invalid','Brochure QA','sales_agent',hash,salt]);
    const session = await (await post('/api/auth/login',{email:'staff@example.invalid',password:pw})).json();
    assert.equal(session.success,true);
    const opts = {headers:{Authorization:'Bearer '+session.token}};
    const detail = await (await fetch(base+'/api/crm/leads?leadId='+created.referenceId,opts)).json();
    assert.equal(detail.success,true);
    const row = detail.lead, chosen = row.brochure;
    assert.equal(row.source,'estate_brochure'); assert.equal(row.estate_model, estate.name);
    assert.equal(chosen.packageId,pkg.id); assert.equal(chosen.packageName,pkg.name);
    assert.equal(chosen.indicativePriceCr,pkg.price); assert.equal(chosen.contactMethod,'email');
    assert.equal(chosen.consent,true); assert.ok(chosen.consentAt); assert.equal(row.phone,'');
    const index = await (await fetch(base+'/api/crm/leads',opts)).json();
    assert.equal(index.leads.length,1); assert.equal(index.leads[0].reference_id,created.referenceId);
    const csv = await (await fetch(base+'/api/crm/leads?export=csv',opts)).text();
    assert.ok(csv.includes(pkg.name)); assert.ok(csv.includes(created.referenceId));
    assert.equal((await db.get('SELECT COUNT(*) AS count FROM notification_queue')).count,1);
    console.log('Authenticated CRM round trip: %s / %s / %s / %s. One enquiry and one queued notification; CSV verified. Disposable local SQLite; nothing dispatched.', created.referenceId, estate.name, pkg.name, pkg.price ?? 'Price pending confirmation');
  } finally {
    server.closeAllConnections(); if (server.listening) await new Promise(done => server.close(done));
    process.chdir(initial); fs.rmSync(sandbox,{recursive:true,force:true});
  }
}
test().catch(err => {console.error(err); process.exitCode=1;});
