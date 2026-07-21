import express from 'express';

const app = express();

//Middlewares
app.use(express.json());

//Healt check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'WolfConnect API is running',
  });
});

export default app;
