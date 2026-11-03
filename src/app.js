import express from 'express';
import runsRouter from './routes/runs.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  if (req.headers['x-user-id']) {
    req.user = { id: Number(req.headers['x-user-id']) };
  }
  next();
});

app.use('/api/runs', runsRouter);

export default app;
