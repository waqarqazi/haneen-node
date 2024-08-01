/* eslint-disable camelcase */
/* eslint-disable */
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set('strictQuery', false);
const dbConnection = async () => {
  try {
    let db_url = '';
    if (process.env.MONGO_URI) {
      db_url = process.env.MONGO_URI;
    } else {
      db_url = process.env.MONGO_URI;
    }
    const connected = await mongoose.connect(db_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (connected) {
      console.log('Connected to the mongoDB');
      return true;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = dbConnection;
