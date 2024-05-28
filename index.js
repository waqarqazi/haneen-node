require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const errorHandler = require('./middleware/errorMiddleware'); // Import directly as errorHandler
const routes = require('./routes'); // Import your routes

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

app.use(
  cors({
    origin: true,
  }),
);
app.use(express.json({ limit: '50mb' }));
// Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// Use routes
app.use('/api', routes); // Ensure routes is correctly imported and used

// Error handling middleware
app.use(errorHandler); // Use the errorHandler middleware

// Start the server
const PORT = process.env.PORT || 5000;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal server error' });
});

app.get('*', (req, res) => {
  console.log('Status runing');
  return res.status(200).send('Up & Running');
});

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
    console.log('err', err);
  });
