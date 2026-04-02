const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitize = require('./middleware/sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const lookupService = require('./utils/lookupService');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize the lookup service (load data once)
lookupService.init();

const app = express();

// 1. Set security HTTP headers (Enterprise standard)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "res.cloudinary.com", "*.cloudinary.com"],
        "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        "font-src": ["'self'", "fonts.gstatic.com"],
        "connect-src": ["'self'"],
      },
    },
  })
);

// 2. Global Rate Limiting: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// 3. NoSQL Injection protection (Custom Express 5 compatible)
app.use(sanitize);

// 4. HTTP Parameter Pollution protection
app.use(hpp());

// 6. Gzip compression
app.use(compression());

// 7. Configurable CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tvs-parts-list.onrender.com', 'https://tvs-wms.onrender.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parts', require('./routes/parts'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
require("./ping.js");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist"), {
    maxAge: '7d',
    etag: true,
    immutable: true
  }));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
