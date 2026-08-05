require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const leadRoutes = require('./routes/lead.routes');
const taskRoutes = require('./routes/task.routes');
const employeeRoutes = require('./routes/employee.routes');
const reportRoutes = require('./routes/report.routes');
const assistantRoutes = require('./routes/assistant.routes');
const settingsRoutes = require('./routes/settings.routes');

const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration allowing local dev & deployed frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Trishul CRM REST API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', employeeRoutes);
app.use('/api', reportRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/settings', settingsRoutes);

// Centralized Error Middleware
app.use(errorMiddleware);

// Connect Database & Start Server
connectDB().then((conn) => {
  app.listen(PORT, () => {
    if (conn) {
      console.log(`🚀 Trishul CRM Server running on port ${PORT}`);
    } else {
      console.log(`⚠️ Server running on port ${PORT} (MongoDB disconnected)`);
    }
  });
});
