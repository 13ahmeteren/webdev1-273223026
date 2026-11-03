import { getNodeById } from '../data/nodes.js';
import { insertRun } from '../data/runs.js';

export class WattageExceeded extends Error {
  constructor(message = 'Wattage exceeds node TDP limit') {
    super(message);
    this.name = 'WattageExceeded';
  }
}

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function createRun({ userId, nodeId, runtimeMs, wattage }) {
  if (runtimeMs === undefined || runtimeMs === null || runtimeMs <= 0) {
    throw new ValidationError('Runtime is required and must be positive');
  }

  const node = getNodeById(nodeId);
  if (!node) {
    throw new NotFoundError('Node not found');
  }

  const maxWatts = node.max_watts ?? node.wattage;
  if (wattage > maxWatts) {
    throw new WattageExceeded(`Wattage ${wattage} exceeds node maximum TDP ${maxWatts}`);
  }

  return insertRun({ userId, nodeId, runtimeMs, wattage });
}
