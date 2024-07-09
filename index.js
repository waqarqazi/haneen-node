require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const routes = require('./routes');
const User = require('./models/User');
const Message = require('./models/Message');
const Like = require('./models/Like');
const Room = require('./models/Room');

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
    origin: 'http://127.0.0.1:3000',
    methods: ['GET', 'POST'],
  },
});
global.io = io;

// Socket.io connection handler
// Socket.io configuration
io.on('connection', socket => {
  console.log('New client connected');

  // Handle user liking another user
  socket.on('like', async ({ userId, likedUserId }) => {
    try {
      const like = new Like({ user_id: userId, liked_user_id: likedUserId });
      await like.save();
      console.log('saved');

      const mutualLike = await Like.findOne({
        liked_user_id: likedUserId,
        user_id: userId,
      });

      if (mutualLike) {
        const roomId = [userId, likedUserId].sort().join('-');
        io.to(roomId).emit('match', { message: "It's a match!", roomId });

        // Check if a room already exists for these users
        let room =
          (await Room.findOne({ user1: userId, user2: likedUserId })) ||
          (await Room.findOne({ user1: likedUserId, user2: userId }));

        if (!room) {
          room = new Room({ user1: userId, user2: likedUserId, roomId });
          await room.save();
        }
        console.log('Existing room id', room.roomId);
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Join a chat room
  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);

    // Load chat history for the room
    Message.find({
      $or: [
        { sender: roomId.split('-')[0], receiver: roomId.split('-')[1] },
        { sender: roomId.split('-')[1], receiver: roomId.split('-')[0] },
      ],
    })
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
      console.log('message', message);
      try {
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          message,
        });
        await newMessage.save();

        // Update last message in the room
        await Room.findOneAndUpdate(
          { roomId },
          {
            lastMessage: {
              sender: senderId,
              message,
              timestamp: new Date(),
            },
          },
        );

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
