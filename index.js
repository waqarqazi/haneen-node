/* eslint-disable */
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes');
const port = process.env.PORT;
const app = express();

app.use(
  cors({
    origin: true,
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use('/api', routes);
require('./startup/db')();
app.listen(port, () => console.log(`Listening on port ${port}...`)); // Fixed typo
