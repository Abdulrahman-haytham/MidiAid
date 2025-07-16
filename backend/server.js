

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { connectDB, closeDB } = require('./src/core/config/database');
const configureRoutes = require('./src/routes');
const startServer = require('./startServer');

const requiredEnv = ['MongoURI', 'JWT_SECRET'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

(async () => {
  try {
    await connectDB();

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(helmet());

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, try again later.'
    });
    app.use('/api', apiLimiter);

    app.use(express.static(path.join(__dirname, 'dist')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    configureRoutes(app);

    app.use('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(404).json({
          message: `API endpoint not found: ${req.method} ${req.originalUrl}`
        });
      }
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    startServer(app, PORT, closeDB); // 🧠 تم تمرير دالة الإغلاق
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
