require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const routes = require('./routes');
const User = require('./models/User');
const Message = require('./models/Message');
const Like = require('./models/Like');

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

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
global.io = io;

// Socket.io connection handler
// Socket.io configuration
io.on('connection', socket => {
  console.log('New client connected');

  // Join a chat room
  socket.on('joinRoom', async ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);

    // Load chat history for the room
    Message.find({ roomId })
      .sort('timestamp')
      .exec((err, messages) => {
        if (err) {
          console.error(err);
        } else {
          socket.emit('loadChatHistory', messages);
        }
      });
  });

  // Handle sending a message
  socket.on(
    'sendMessage',
    async ({ roomId, senderId, receiverId, message }) => {
      try {
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          message,
          roomId,
          lastMessage: {
            content: 'test',
          },
        });
        await newMessage.save();

        io.to(roomId).emit('message', newMessage);
      } catch (err) {
        console.error(err);
      }
    },
  );

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
server.listen(port, () => console.log(`Listning on port ${port}...`));
