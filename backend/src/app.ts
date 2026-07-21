import express from 'express';
import { errorHandler } from './presentation/middlewares/error-handler.middleware.js';

const app = express();

//Middlewares
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'WolfConnect API is running',
  });
});

app.use(errorHandler);

export default app;
