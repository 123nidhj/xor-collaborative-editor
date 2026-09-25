import { test, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import mongoose from 'mongoose';
import { app } from '../server.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Document from '../src/models/Document.js';

let testServer;
let baseUrl;
let tokenUserA;
let userAId;
let tokenUserB;
let userBId;
let createdDocId;

// Helper to make HTTP JSON requests against test server
const request = async (method, path, body = null, token = null) => {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

before(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();

  // Clear test collections
  await User.deleteMany({ email: /@test\.local$/ });
  await Document.deleteMany({ title: /Test/ });

  testServer = http.createServer(app);
  await new Promise((resolve) => {
    testServer.listen(0, () => {
      const port = testServer.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  try {
    await User.deleteMany({ email: /@test\.local$/ });
    await Document.deleteMany({ title: /Test/ });
    if (testServer) {
      if (typeof testServer.closeAllConnections === 'function') {
        testServer.closeAllConnections();
      }
      await new Promise((resolve) => testServer.close(resolve));
    }
    await disconnectDB();
  } catch (err) {
    console.error('Teardown error:', err);
  }
});

test('1. Health check returns 200 and database status', async () => {
  const res = await request('GET', '/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'ok');
  assert.strictEqual(res.data.database.status, 'connected');
});

test('2. User Registration works and validates fields', async () => {
  // Missing fields
  const failRes = await request('POST', '/api/auth/register', { email: 'bad@test.local' });
  assert.strictEqual(failRes.status, 400);

  // Success
  const res = await request('POST', '/api/auth/register', {
    name: 'Alice Cooper',
    email: 'alice@test.local',
    password: 'password123',
  });

  assert.strictEqual(res.status, 201);
  assert.ok(res.data.token);
  assert.strictEqual(res.data.user.email, 'alice@test.local');
  tokenUserA = res.data.token;
  userAId = res.data.user._id;

  // Duplicate email rejection
  const dupRes = await request('POST', '/api/auth/register', {
    name: 'Alice Clone',
    email: 'alice@test.local',
    password: 'password123',
  });
  assert.strictEqual(dupRes.status, 400);
});

test('3. User Login authenticates valid credentials and rejects wrong passwords', async () => {
  // Wrong password
  const failRes = await request('POST', '/api/auth/login', {
    email: 'alice@test.local',
    password: 'wrongpassword',
  });
  assert.strictEqual(failRes.status, 401);

  // Valid credentials
  const res = await request('POST', '/api/auth/login', {
    email: 'alice@test.local',
    password: 'password123',
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.token);

  // Create User B for collaboration tests
  const regB = await request('POST', '/api/auth/register', {
    name: 'Bob Martin',
    email: 'bob@test.local',
    password: 'password123',
  });
  tokenUserB = regB.data.token;
  userBId = regB.data.user._id;
});

test('4. Protected route /api/auth/me requires valid JWT', async () => {
  // Without token
  const unauthRes = await request('GET', '/api/auth/me');
  assert.strictEqual(unauthRes.status, 401);

  // With token
  const authRes = await request('GET', '/api/auth/me', null, tokenUserA);
  assert.strictEqual(authRes.status, 200);
  assert.strictEqual(authRes.data.user.email, 'alice@test.local');
});

test('5. Document CRUD and Sharing workflow', async () => {
  // Create document
  const createRes = await request(
    'POST',
    '/api/documents',
    {
      title: 'Test Collaborative Architecture',
      content: 'const collab = true;',
      language: 'javascript',
    },
    tokenUserA
  );

  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(createRes.data.document.title, 'Test Collaborative Architecture');
  createdDocId = createRes.data.document._id;

  // Fetch document by ID
  const getRes = await request('GET', `/api/documents/${createdDocId}`, null, tokenUserA);
  assert.strictEqual(getRes.status, 200);
  assert.strictEqual(getRes.data.role, 'owner');

  // User B tries to view before being shared (should be forbidden 403)
  const forbiddenRes = await request('GET', `/api/documents/${createdDocId}`, null, tokenUserB);
  assert.strictEqual(forbiddenRes.status, 403);

  // Share document with User B
  const shareRes = await request(
    'POST',
    `/api/documents/${createdDocId}/share`,
    { email: 'bob@test.local', role: 'editor' },
    tokenUserA
  );
  assert.strictEqual(shareRes.status, 200);

  // User B can now view the document
  const accessRes = await request('GET', `/api/documents/${createdDocId}`, null, tokenUserB);
  assert.strictEqual(accessRes.status, 200);
  assert.strictEqual(accessRes.data.role, 'editor');

  // User B updates content
  const updateRes = await request(
    'PUT',
    `/api/documents/${createdDocId}`,
    { content: 'const collab = true; console.log("Bob edited this!");' },
    tokenUserB
  );
  assert.strictEqual(updateRes.status, 200);
  assert.ok(updateRes.data.document.content.includes('Bob edited this!'));

  // User B tries to delete document (forbidden, only owner can delete)
  const delForbidden = await request('DELETE', `/api/documents/${createdDocId}`, null, tokenUserB);
  assert.strictEqual(delForbidden.status, 403);

  // User A (owner) deletes document
  const delRes = await request('DELETE', `/api/documents/${createdDocId}`, null, tokenUserA);
  assert.strictEqual(delRes.status, 200);

  // Verify it is gone
  const notFoundRes = await request('GET', `/api/documents/${createdDocId}`, null, tokenUserA);
  assert.strictEqual(notFoundRes.status, 404);
});
