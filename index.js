/* eslint-disable */
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();
const routes = require('./routes');
const setupChatSocket = require('./startup/setup-chat-socket.js');
const likeMatchHandling = require('./startup/like-match-handling.js');
//const Room = require('./models/Room');

const app = express();
// const initializeFirebase = require('./config/firebase');
// const sendNotification = require('./utils/notifications');
// this is comment for testing husky
app.use(
  cors({
    origin: true,
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use('/api', routes);
// initializeFirebase();

// require('./startup/logging');
// require('./startup/route')(app);
require('./startup/db')();

const port = process.env.PORT;
const server = http.createServer(app);
const io = socketio(server);
global.io = io;
setupChatSocket(io);
likeMatchHandling(io);

server.listen(port, () => console.log(`Listning on portt ${port}...`));
