import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { authRoutes } from './routes/auth.routes.js';
import { cvRoutes } from './routes/cv.routes.js';
import { jobRoleRoutes } from './routes/job-role.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { atsRoutes } from './routes/ats.routes.js';
import { importRoutes } from './routes/import.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security & Parsing
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multi-Level Structured Request Logger
app.use(requestLogger);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', importRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/job-roles', jobRoleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ats', atsRoutes);

// Global Centralized Error Boundary
app.use(errorHandler);

// Server Start
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(
      'Server',
      `CareerPrepster Backend API running at http://localhost:${env.PORT}`
    );
    logger.info('Server', `Environment: [${env.NODE_ENV.toUpperCase()}] | CORS: ${env.CLIENT_URL}`);
    logger.debug('Server', 'Debug logging active - all incoming request payloads will be logged');
  });
}

export default app;
