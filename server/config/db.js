const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS for SRV record resolution (fixes querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Fallback silently if setServers is restricted
}

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trishul-crm';
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      family: 4, // Force IPv4 resolution
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    return null;
  }
};


module.exports = connectDB;

