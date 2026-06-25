import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: false, // For development and simple streaming
}));
app.use(morgan('dev'));

// Passport session setup
app.use(passport.initialize());

// Static folder for uploads (for development)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes placeholder
app.get('/', (req: Request, res: Response) => {
  res.send('S.A.M API is running...');
});

// Health Check for Render
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import './config/passport.js';

// ... (previous middlewares)

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
// app.use('/api/admin', adminRoutes);

const PORT = Number(process.env.PORT) || 5000;

// Global Error Handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
