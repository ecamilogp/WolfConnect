import express from 'express';

import authRoutes from './presentation/routes/auth.routes.js';
import userRoutes from './presentation/routes/user.routes.js';
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

//Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

//Error handler
app.use(errorHandler);

export default app;
