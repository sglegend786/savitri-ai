const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('Savitri AI API is running...');
});

// Keep-alive ping to prevent Render free-tier from sleeping
const https = require('https');
setInterval(() => {
  const backendUrl = 'https://savitri-backend.onrender.com';
  const frontendUrl = 'https://savitri-frontend.onrender.com'; // User needs to use this name on Render
  
  https.get(backendUrl, (res) => {
    console.log(`Keep-alive ping backend: ${res.statusCode}`);
  }).on('error', (e) => {});
  
  https.get(frontendUrl, (res) => {
    console.log(`Keep-alive ping frontend: ${res.statusCode}`);
  }).on('error', (e) => {});
}, 14 * 60 * 1000); // 14 minutes


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
