require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const { connectDB } = require('./config/db');

const app = express();

// Security middleware
app.use(helmet());
app.use(xss());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/period', require('./routes/period'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CuraBreast API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CuraBreast API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
};

start();
