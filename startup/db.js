const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const dbConnection = async () => {
  try {
    const db_url = process.env.MONGO_URI;

    if (!db_url) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    const connected = await mongoose.connect(db_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (connected) {
      console.log('Connected to MongoDB');
      return true;
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return false;
  }
};

module.exports = dbConnection;
