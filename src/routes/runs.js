import { Router } from 'express';
import { createRun, WattageExceeded, ValidationError, NotFoundError } from '../services/runs.js';

const router = Router();

function requireAuth(req, res, next) {
  const userId = req.user?.id || req.headers['x-user-id'] || (req.session && req.session.userId);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = Number(userId);
  next();
}

router.post('/', requireAuth, (req, res) => {
  try {
    const { nodeId, runtimeMs, wattage } = req.body;
    const run = createRun({
      userId: req.userId,
      nodeId,
      runtimeMs,
      wattage,
    });
    return res.status(201).json(run);
  } catch (err) {
    if (err instanceof WattageExceeded) {
      return res.status(409).json({ error: err.message });
    }
    if (err instanceof ValidationError) {
      return res.status(422).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

export default router;
