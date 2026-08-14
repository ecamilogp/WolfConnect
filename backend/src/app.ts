import express from 'express';

import authRoutes from './presentation/routes/auth.routes.js';
import userRoutes from './presentation/routes/user.routes.js';
import chatRoutes from './presentation/routes/chat.routes.js';
import platformInvitationRoutes from './presentation/routes/platform-invitation.routes.js';
import notificationRoutes from './presentation/routes/notification.routes.js';

import { errorHandler } from './presentation/middlewares/error-handler.middleware.js';
import { UPLOADS_ROOT } from './config/attachment.config.js';

const app = express();

//Middlewares
app.use(express.json());

// Serves locally-stored uploads (avatars, attachments) as static files.
app.use('/uploads', express.static(UPLOADS_ROOT));

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
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/platform-invitations', platformInvitationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
  });
});

//Error handler
app.use(errorHandler);

export default app;
