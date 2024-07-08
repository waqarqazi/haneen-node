require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const routes = require('./routes');

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

const port = process.env.NODE_ENV ? 8080 : 3000;
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', client => {
  console.log('A user is connected with io ');
  client.on('disconnect', () => {
    console.log('user disconnected');
  });

  client.on('sendMessage', messageData => {
    console.log('messageData', messageData);
    io.emit('receiveMessage', messageData);
  });
});

server.listen(port, () => console.log(`Listning on port ${port}...`));
