const enquiryHandler = require('../api/enquiry');
const loginHandler = require('../api/auth/login');
const verifyHandler = require('../api/auth/verify');
const leadsHandler = require('../api/crm/leads');
const logoutHandler = require('../api/auth/logout');

function createMockReqRes({ method = 'GET', body = {}, headers = {}, url = '/' }) {
  const req = {
    method,
    body,
    headers: { 'user-agent': 'TestRunner/1.0', ...headers },
    url,
    socket: { remoteAddress: '127.0.0.1' }
  };
  let statusCode = 200;
  const resHeaders = {};
  let responseData = null;

  const res = {
    status(code) { statusCode = code; return this; },
    setHeader(name, val) { resHeaders[name.toLowerCase()] = val; return this; },
    json(data) { responseData = data; return this; },
    send(data) { responseData = data; return this; },
    end() { return this; }
  };

  return { req, res, getResult: () => ({ statusCode, resHeaders, responseData }) };
}

async function runTests() {
  console.log('=== Running End-to-End API Tests ===');

  // Test 1: Submit enquiry
  console.log('\n1. Testing Enquiry Submission...');
  const t1 = createMockReqRes({
    method: 'POST',
    body: {
      fullName: 'Vikramaditya Singhania',
      email: 'vikram.singhania@example.com',
      phone: '+91 98200 12345',
      estateModel: '3BHK 3500 sq.ft',
      buyerType: 'Second Home',
      budgetRange: '₹2.5 Cr - ₹3 Cr',
      cityCountry: 'Mumbai, India',
      message: 'Interested in private forest estate with agro plantation.'
    }
  });
  await enquiryHandler(t1.req, t1.res);
  const r1 = t1.getResult();
  console.log('Status:', r1.statusCode, 'Response:', r1.responseData);
  if (r1.statusCode !== 200 || !r1.responseData.success) throw new Error('Enquiry submission failed');
  const refId = r1.responseData.referenceId;

  // Test 2: Duplicate enquiry
  console.log('\n2. Testing Duplicate Submission...');
  const t2 = createMockReqRes({
    method: 'POST',
    body: {
      fullName: 'Vikramaditya Singhania',
      email: 'vikram.singhania@example.com',
      phone: '+91 98200 12345',
      estateModel: '3BHK 3500 sq.ft'
    }
  });
  await enquiryHandler(t2.req, t2.res);
  const r2 = t2.getResult();
  console.log('Status:', r2.statusCode, 'Duplicate detected:', r2.responseData.isDuplicate, 'Ref:', r2.responseData.referenceId);
  if (r2.responseData.referenceId !== refId) throw new Error('Deduplication did not return existing ref');

  // Test 3: Unauthenticated CRM Access
  console.log('\n3. Testing Unauthenticated CRM Access...');
  const t3 = createMockReqRes({ method: 'GET', url: '/api/crm/leads' });
  await leadsHandler(t3.req, t3.res);
  const r3 = t3.getResult();
  console.log('Status:', r3.statusCode, 'Error:', r3.responseData?.error);
  if (r3.statusCode !== 401) throw new Error('CRM allowed unauthenticated access!');

  // Test 4: Staff Login
  console.log('\n4. Testing Staff Login...');
  const t4 = createMockReqRes({
    method: 'POST',
    body: { email: 'admin@bluechipagro.com', password: 'Tempor@ryPassword2026!' }
  });
  await loginHandler(t4.req, t4.res);
  const r4 = t4.getResult();
  console.log('Status:', r4.statusCode, 'Token generated:', !!r4.responseData?.token, 'Role:', r4.responseData?.user?.role);
  if (r4.statusCode !== 200) throw new Error('Login failed');
  const token = r4.responseData.token;

  // Test 5: Authenticated CRM Leads Fetch
  console.log('\n5. Testing Authenticated CRM Leads Fetch...');
  const t5 = createMockReqRes({
    method: 'GET',
    url: '/api/crm/leads',
    headers: { authorization: 'Bearer ' + token }
  });
  await leadsHandler(t5.req, t5.res);
  const r5 = t5.getResult();
  console.log('Status:', r5.statusCode, 'Total Leads KPI:', r5.responseData?.kpi?.total, 'Leads Count:', r5.responseData?.leads?.length);
  if (r5.statusCode !== 200 || r5.responseData.leads.length === 0) throw new Error('Authenticated leads fetch failed');

  // Test 6: Update Lead Status with Audit Attribution
  console.log('\n6. Testing Lead Status Update...');
  const t6 = createMockReqRes({
    method: 'PATCH',
    headers: { authorization: 'Bearer ' + token },
    body: { id: refId, status: 'contacted' }
  });
  await leadsHandler(t6.req, t6.res);
  const r6 = t6.getResult();
  console.log('Status:', r6.statusCode, 'Audit Notes:', r6.responseData?.auditNotes);
  if (r6.statusCode !== 200) throw new Error('Lead update failed');

  // Test 7: Add Custom Note
  console.log('\n7. Testing Add Note...');
  const t7 = createMockReqRes({
    method: 'POST',
    headers: { authorization: 'Bearer ' + token },
    body: { leadId: refId, content: 'Spoke with client. Arranging private site walkthrough next week.' }
  });
  await leadsHandler(t7.req, t7.res);
  const r7 = t7.getResult();
  console.log('Status:', r7.statusCode, 'Note Author:', r7.responseData?.note?.author_name);
  if (r7.statusCode !== 200) throw new Error('Add note failed');

  // Test 8: Logout
  console.log('\n8. Testing Logout...');
  const t8 = createMockReqRes({
    method: 'POST',
    headers: { authorization: 'Bearer ' + token }
  });
  await logoutHandler(t8.req, t8.res);
  const r8 = t8.getResult();
  console.log('Status:', r8.statusCode, 'Message:', r8.responseData?.message);

  // Test 9: Verify Session after logout
  console.log('\n9. Testing Verify Session after logout...');
  const t9 = createMockReqRes({
    method: 'GET',
    headers: { authorization: 'Bearer ' + token }
  });
  await verifyHandler(t9.req, t9.res);
  const r9 = t9.getResult();
  console.log('Status:', r9.statusCode, 'Authenticated:', r9.responseData?.authenticated);
  if (r9.statusCode !== 401) throw new Error('Session should be invalid after logout!');

  console.log('\n>>> ALL 9 TESTS PASSED FLAWLESSLY! <<<');
}

runTests().catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
