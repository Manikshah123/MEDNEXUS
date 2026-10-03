require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/wards', require('./routes/wards'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/pharmacy', require('./routes/pharmacy'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/search', require('./routes/search'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MEDNEXUS Server running on port ${PORT}`);
});
