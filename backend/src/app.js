import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Route modules
import authRoutes from './routes/auth.js';
import predictRoutes from './routes/predict.js';
import diseaseRoutes from './routes/disease.js';
import chatRoutes from './routes/chat.js';
import reportRoutes from './routes/report.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Adjust to specific frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API endpoints routing mounts
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.use('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled server exception caught:", err);
  res.status(500).json({
    message: "An internal server error occurred.",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`AgroMind AI Express server online at: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`==================================================`);
});

export default app;
