import db from './db.js';

export function insertRun({ userId, nodeId, runtimeMs, wattage }) {
  const stmt = db.prepare(`
    INSERT INTO runs (user_id, node_id, runtime_ms, wattage)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(userId, nodeId, runtimeMs, wattage);
  return {
    id: result.lastInsertRowid,
    userId,
    nodeId,
    runtimeMs,
    wattage,
  };
}

export function getRunById(id) {
  const stmt = db.prepare('SELECT * FROM runs WHERE id = ?');
  return stmt.get(id);
}
