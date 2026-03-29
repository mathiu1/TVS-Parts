const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
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
    maxAge: '1d', // Cache static assets for 1 day
    etag: false
  }));


  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });

}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
