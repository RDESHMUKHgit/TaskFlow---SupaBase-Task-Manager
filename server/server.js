import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests (allows Netlify, localhost, and custom domains with credentials)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use(morgan('dev'));

// Root endpoint for Render health checks and uptime probes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'TaskFlow API Server',
    message: 'Welcome to TaskFlow Supabase & Express API! 🚀',
    endpoints: {
      health: '/api/health',
      tasks: '/api/tasks',
    },
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'TaskFlow API Server',
    timestamp: new Date().toISOString(),
  });
});

// Mount Task routes
app.use('/api/tasks', taskRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Tasks Manager Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints available at http://localhost:${PORT}/api/tasks`);
});
