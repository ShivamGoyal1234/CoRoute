import http from 'http';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import config from './config';
import { connectDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initSocket } from './socket/socket.service';

import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';
import membershipRoutes from './routes/membership.routes';
import dayRoutes from './routes/day.routes';
import activityRoutes from './routes/activity.routes';
import commentRoutes from './routes/comment.routes';
import attachmentRoutes from './routes/attachment.routes';
import checklistRoutes from './routes/checklist.routes';
import tripFileRoutes from './routes/tripFile.routes';
import webhookRoutes from './routes/webhook.routes';

const app: Application = express();

connectDatabase();

app.use(helmet());



// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100,
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use('/api', limiter);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/days', dayRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/trip-files', tripFileRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'CoRoute API - Collaborative Trip Planning Platform',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = config.port;
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`CoRoute Server Started Successfully on port ${PORT}`);
});

export default app;
