import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import db from '../src/data/db.js';
import { createRun, WattageExceeded } from '../src/services/runs.js';

let server;
let baseUrl;

test.before(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT);
    CREATE TABLE IF NOT EXISTS nodes (id INTEGER PRIMARY KEY, name TEXT, max_watts REAL, wattage REAL);
    CREATE TABLE IF NOT EXISTS runs (id INTEGER PRIMARY KEY, user_id INT, node_id INT, runtime_ms REAL, wattage REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  `);
  server = app.listen(0);
  const addr = server.address();
  baseUrl = `http://localhost:${addr.port}`;
});

test.after(() => {
  server?.close();
});

test('[AC-13] createRun throws WattageExceeded when wattage exceeds node max_watts', () => {
  db.exec('DELETE FROM runs; DELETE FROM nodes; DELETE FROM users;');
  db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(1, 'engineer@example.com');
  db.prepare('INSERT INTO nodes (id, name, max_watts) VALUES (?, ?, ?)').run(10, 'Test GPU Node', 250);

  assert.throws(() => {
    createRun({
      userId: 1,
      nodeId: 10,
      runtimeMs: 1500,
      wattage: 300
    });
  }, (err) => err instanceof WattageExceeded);
});

test('[AC-12] valid POST /api/runs returns 201 Created', async () => {
  db.exec('DELETE FROM runs; DELETE FROM nodes; DELETE FROM users;');
  db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(1, 'engineer@example.com');
  db.prepare('INSERT INTO nodes (id, name, max_watts) VALUES (?, ?, ?)').run(10, 'Test GPU Node', 250);

  const res = await fetch(`${baseUrl}/api/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': '1'
    },
    body: JSON.stringify({
      nodeId: 10,
      runtimeMs: 1000,
      wattage: 200
    })
  });

  assert.strictEqual(res.status, 201);
  const data = await res.json();
  assert.ok(data.id);
  assert.strictEqual(data.nodeId, 10);
});

test('[AC-14] unauthenticated POST /api/runs returns 401 Unauthorized', async () => {
  const res = await fetch(`${baseUrl}/api/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nodeId: 10,
      runtimeMs: 1000,
      wattage: 200
    })
  });

  assert.strictEqual(res.status, 401);
});
