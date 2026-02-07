require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const dailyEntriesRoutes = require('./routes/dailyEntriesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// CORS (adjust CLIENT_ORIGIN to match your React dev server)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});





app.use('/api/auth', authRoutes);
app.use('/api/daily-entries', dailyEntriesRoutes);
app.use('/api/dashboard', dashboardRoutes);


module.exports = app;
