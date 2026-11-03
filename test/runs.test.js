import test from 'node:test';
import assert from 'node:assert';
import { createRun, WattageExceeded } from '../src/services/runs.js';
import db from '../src/data/db.js';

test('[AC-13] createRun throws WattageExceeded when wattage exceeds node max_watts', () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT);
    CREATE TABLE IF NOT EXISTS nodes (id INTEGER PRIMARY KEY, name TEXT, max_watts REAL, wattage REAL);
    CREATE TABLE IF NOT EXISTS runs (id INTEGER PRIMARY KEY, user_id INT, node_id INT, runtime_ms REAL, wattage REAL);
  `);
  
  db.exec('DELETE FROM runs; DELETE FROM nodes; DELETE FROM users;');
  
  db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').run(1, 'engineer@example.com');
  db.prepare('INSERT INTO nodes (id, name, max_watts) VALUES (?, ?, ?)').run(10, 'Test GPU Node', 250);

  assert.throws(() => {
    createRun({
      userId: 1,
      nodeId: 10,
      runtimeMs: 1500,
      wattage: 300 // Exceeds 250W limit
    });
  }, (err) => {
    return err instanceof WattageExceeded;
  });
});
