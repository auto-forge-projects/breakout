import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = createServer().listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /health -> {status:"ok"}, sürüm/env sızdırmaz (SEC-5)', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, { status: 'ok' });
});

test('GET / -> index.html statik dosyası servis edilir', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /html/);
});

test('sunucu parmak izi verilmez (SEC-1: x-powered-by yok)', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('güvenlik header\'ları uygulanır (SEC-2: CSP, nosniff, HSTS, frame-ancestors)', async () => {
  const res = await fetch(`${base}/health`);
  assert.ok(res.headers.get('content-security-policy'), 'CSP header eksik');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.ok(res.headers.get('strict-transport-security'), 'HSTS header eksik');
});

test('dotfile isteği reddedilir (SEC-3: gizli dosya koruması)', async () => {
  const res = await fetch(`${base}/.env`);
  assert.equal(res.status, 404);
});

test('path traversal denemesi reddedilir (SEC-3)', async () => {
  const res = await fetch(`${base}/../../etc/passwd`);
  assert.notEqual(res.status, 200);
});

test('POST metoduna izin verilmez (SEC-4: yalnız GET/HEAD)', async () => {
  const res = await fetch(`${base}/`, { method: 'POST' });
  assert.equal(res.status, 404);
});

test('bilinmeyen yol 404 döner ve stack trace sızdırmaz (SEC-13)', async () => {
  const res = await fetch(`${base}/olmayan-yol`);
  assert.equal(res.status, 404);
  const text = await res.text();
  assert.doesNotMatch(text, /at\s+\w+\s+\(/);
});
