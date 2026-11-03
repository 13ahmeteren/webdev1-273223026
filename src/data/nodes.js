import db from './db.js';

export function getNodeById(id) {
  const stmt = db.prepare('SELECT * FROM nodes WHERE id = ?');
  return stmt.get(id);
}
