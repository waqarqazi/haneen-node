require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorMiddleware'); // Import directly as errorHandler
const routes = require('./routes'); // Import your routes
const app = express();

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Use routes
app.use('/api', routes); // Ensure routes is correctly imported and used

// Error handling middleware
app.use(errorHandler); // Use the errorHandler middleware

// Start the server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to DB');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    // Pass the error to the errorHandler middleware
    errorHandler(err, req, res, next);
  });
