const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Extract base URI and append database name
    const baseUri = process.env.MONGODB_URI;
    const dbName = 'enigma_pro';
    
    // If URI already has a database name, replace it; otherwise append
    let mongoUri = baseUri;
    if (baseUri.includes('/?') || baseUri.endsWith('/')) {
      mongoUri = baseUri.replace(/\/[^/?]*(\?|$)/, `/${dbName}$1`);
    } else if (!baseUri.match(/\/[^/?]+(\?|$)/)) {
      mongoUri = `${baseUri}/${dbName}`;
    } else {
      mongoUri = baseUri.replace(/\/([^/?]+)(\?|$)/, `/${dbName}$2`);
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected to enigma_pro database');
  } catch (err) {
    console.error('DB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
