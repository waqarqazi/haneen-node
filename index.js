/* eslint-disable */
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();
const routes = require('./routes');
//const User = require('./models/User');
//const Message = require('./models/Message');
const Like = require('./models/Like');
const SuperLike = require('./models/SuperLike');
const User = require('./models/User');
const ChatMessageModel = require('./models/ChatMessage');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');
const Match = require('./models/Match');
const Skip = require('./models/SkipUser');
const { ActionHistory } = require('./models/ActionHistory.js');
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

app.get('*', (req, res) => {
  console.log('Status runing');
  return res.status(200).send('Up & Running');
});

app.use(express.json({ limit: '50mb' }));
app.use('/api', routes);
// initializeFirebase();

// require('./startup/logging');
// require('./startup/route')(app);
require('./startup/db')();

const port = process.env.PORT;
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: 'http://192.168.1.16:3000',
    methods: ['GET', 'POST'],
  },
});
global.io = io;

// Socket.io connection handler
// Socket.io connection handler
// Socket.io configuration
// io.on('connection', socket => {
//   console.log('New client connected');

//   // Handle user liking another user
//   socket.on('like', async ({ userId, likedUserId }) => {
//     try {
//       const like = new Like({ user_id: userId, liked_user_id: likedUserId });
//       await like.save();
//       console.log('saved');

//       const mutualLike = await Like.findOne({
//         liked_user_id: likedUserId,
//         user_id: userId,
//       });

//       // if (mutualLike) {
//       //   const roomId = [userId, likedUserId].sort().join('-');
//       //   io.to(roomId).emit('match', { message: "It's a match!", roomId });

//       //   // Check if a room already exists for these users
//       //   let room =
//       //     (await Room.findOne({ user1: userId, user2: likedUserId })) ||
//       //     (await Room.findOne({ user1: likedUserId, user2: userId }));

//       //   if (!room) {
//       //     room = new Room({ user1: userId, user2: likedUserId, roomId });
//       //     await room.save();
//       //   }
//       //   console.log('Existing room id', room.roomId);
//       // }
//     } catch (err) {
//       console.error(err);
//     }
//   });

//   // Join a chat room
//   socket.on('joinRoom', ({ roomId }) => {
//     socket.join(roomId);
//     console.log(`User joined room: ${roomId}`);

//     // Load chat history for the room
//     // Message.find({
//     //   $or: [
//     //     { sender: roomId.split('-')[0], receiver: roomId.split('-')[1] },
//     //     { sender: roomId.split('-')[1], receiver: roomId.split('-')[0] },
//     //   ],
//     // })
//     //   .sort('timestamp')
//     //   .exec((err, messages) => {
//     //     if (err) {
//     //       console.error(err);
//     //     } else {
//     //       socket.emit('loadChatHistory', messages);
//     //     }
//     //   });
//   });

//   // Handle sending a message
//   socket.on(
//     'sendMessage',
//     async ({ roomId, senderId, receiverId, message }) => {
//       console.log('message', message);
//       // try {
//       //   const newMessage = new Message({
//       //     sender: senderId,
//       //     receiver: receiverId,
//       //     message,
//       //   });
//       //   await newMessage.save();

//       //   // Update last message in the room
//       //   await Room.findOneAndUpdate(
//       //     { roomId },
//       //     {
//       //       lastMessage: {
//       //         sender: senderId,
//       //         message,
//       //         timestamp: new Date(),
//       //       },
//       //     },
//       //   );

//       //   io.to(roomId).emit('message', newMessage);
//       // } catch (err) {
//       //   console.error(err);
//       // }
//     },
//   );

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

///likes handling
// Likes namespace connection
const likesNamespace = io.of('/likes');

likesNamespace.on('connection', client => {
  console.log('A user connected to the likes namespace');
  //Skip Handling

  client.on('skip', async ({ userId, skippedUserId }) => {
    console.log('skippedUserId', skippedUserId);
    if (!userId || !skippedUserId) {
      likesNamespace.emit('skip', 'Invalid userId or skippedUserId');
      return;
    }
    try {
      const existingSkip = await Skip.findOne({ userId, skippedUserId });
      const history = new ActionHistory({
        userId,
        actionType: 'skip',
        targetUserId: skippedUserId,
      });
      await history.save();
      console.log('skphistory', history);
      console.log('existingSkip', existingSkip);
      if (existingSkip) {
        likesNamespace.emit('skip', 'Already Skiped');
      } else {
        const skip = new Skip({ userId, skippedUserId });
        await skip.save();
        console.log('creSkip', skip);
        // Emit skip event back to client
        likesNamespace.emit('skip', { userId, skippedUserId });
      }
    } catch (err) {
      console.error(err);
    }
  });

  //Like Handling
  client.on('like', async ({ userId, likedUserId }) => {
    console.log('likedUserId', likedUserId);
    if (!userId || !likedUserId) {
      likesNamespace.emit('like', 'Invalid userId or likedUserId');
      return;
    }
    try {
      const existingLike = await Like.findOne({ userId, likedUserId });
      console.log('existingLike', existingLike);
      if (existingLike) {
        likesNamespace.emit('like', 'Already Liked');
      } else {
        const like = new Like({ userId, likedUserId });
        await like.save();
        const history = new ActionHistory({
          userId,
          actionType: 'like',
          targetUserId: likedUserId,
        });
        await history.save();
        console.log('creLike', like);
        console.log('history', history);
        // Emit like event back to client
        likesNamespace.emit('like', { userId, likedUserId });
      }

      // Check if there's a match
      const reciprocalLike = await Like.findOne({
        userId: likedUserId,
        likedUserId: userId,
      });
      console.log('reciprocalLike', reciprocalLike);
      if (reciprocalLike) {
        const newMatch = new Match({ user1: userId, user2: likedUserId });
        console.log('new', newMatch);
        await newMatch.save();

        // Notify both users about the match
        console.log('userId', userId);
        console.log('likedUserId', likedUserId);

        client.join(userId.toString());
        client.join(likedUserId.toString());

        likesNamespace
          .to(userId.toString())
          .emit('match', { user1: userId, user2: likedUserId });
        likesNamespace
          .to(likedUserId.toString())
          .emit('match', { user1: userId, user2: likedUserId });
        console.log('Match');
      }
    } catch (err) {
      console.error(err);
    }
  });

  //Super Like Handling
  client.on('superLike', async ({ userId, superLikedUserId }) => {
    console.log('superLikedUserId', superLikedUserId);
    if (!userId || !superLikedUserId) {
      likesNamespace.emit('superLike', 'Invalid userId or superLikedUserId');
      return;
    }
    try {
      const existingSupLike = await SuperLike.findOne({
        userId,
        superLikedUserId,
      });
      console.log('existingSupLike', existingSupLike);
      if (existingSupLike) {
        likesNamespace.emit('superLike', 'Already Super Liked');
      } else {
        const like = new SuperLike({ userId, superLikedUserId });
        await like.save();
        const history = new ActionHistory({
          userId,
          actionType: 'superlike',
          targetUserId: superLikedUserId,
        });
        await history.save();
        console.log('suphistory', history);
        console.log('cresupLike', like);
        // Emit like event back to client
        likesNamespace.emit('superLike', { userId, superLikedUserId });
      }

      // Check if there's a match
      const reciprocalLike = await SuperLike.findOne({
        userId: superLikedUserId,
        superLikedUserId: userId,
      });
      console.log('reciprocalLike', reciprocalLike);
      if (reciprocalLike) {
        const newMatch = new Match({ user1: userId, user2: superLikedUserId });
        console.log('new', newMatch);
        await newMatch.save();

        // Notify both users about the match
        console.log('userId', userId);
        console.log('superLikedUserId', superLikedUserId);

        client.join(userId.toString());
        client.join(superLikedUserId.toString());

        likesNamespace
          .to(userId.toString())
          .emit('match', { user1: userId, user2: superLikedUserId });
        likesNamespace
          .to(superLikedUserId.toString())
          .emit('match', { user1: userId, user2: superLikedUserId });
        console.log('Match');
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Add identity of user mapped to the socket id
  client.on('identity', async ({ userId }) => {
    users.push({
      socketId: client.id,
      userId,
    });
  });

  client.on('disconnect', () => {
    users = users.filter(user => user.socketId !== client.id);
    console.log('onDisconnect', users);
  });
});

let users = [];
io.on('connection', client => {
  console.log('A user is connected with io ');
  // add identity of user mapped to the socket id
  client.on('identity', async ({ userId }) => {
    users.push({
      socketId: client.id,
      userId,
    });
  });
  // event fired when the chat room is disconnected
  client.on('disconnect', () => {
    users = users.filter(user => user.socketId !== client.id);
    console.log('onDisconnect', users);
  });
  // subscribe person to chat & other user as well
  client.on(
    'create',
    async ({ likedUserId = [], name, picture, description }) => {
      console.log('new create event called');
      const { userId } = users.find(el => el.socketId === client.id);
      if (likedUserId.length > 0 && userId) {
        const { chatRoomId, isNew, message } = await ChatRoom.initiateChat(
          [...likedUserId],
          userId,
          name,
          picture,
          description,
        );
        console.log(chatRoomId, 'chatroomId');
        const userSockets = users.filter(
          user => user.userId === likedUserId[0],
        );
        userSockets.forEach(userInfo => {
          const socketConn = io.sockets.sockets.get(userInfo.socketId);
          if (socketConn) {
            socketConn.join(chatRoomId);
          }
        });
        client.join(chatRoomId);
        io.to(chatRoomId).emit('OnJoin', {
          message,
          chatRoomId,
          isNew,
        });
      }
    },
  );
  // subscribe group
  client.on('subscribeGroup', async ({ chatRoomId, likedUserId = [] }) => {
    console.log('new create group event called');
    // const { userId } = users.find(el => el.socketId === client.id);
    const userSockets = users.filter(user => likedUserId.includes(user.userId));
    userSockets.forEach(userInfo => {
      const socketConn = io.sockets.sockets.get(userInfo.socketId);
      if (socketConn) {
        socketConn.join(chatRoomId);
      }
    });
    client.join(chatRoomId);
    io.to(chatRoomId).emit('OnJoin', {
      success: true,
    });
  });

  // group message
  client.on('groupMessage', async ({ roomId, messagePayload }) => {
    console.log('new group message event called');
    const { userId } = users.find(el => el.socketId === client.id);
    if (roomId && messagePayload && userId) {
      const post = new ChatMessageModel({
        chatRoomId: roomId,
        message: messagePayload,
        postedByUser: userId,
      });
      const user = await User.findById(userId);
      const chatRoomDb = await ChatRoom.findById(roomId);
      const otherUsers = chatRoomDb.userIds.filter(
        el => el.toString() !== user._id.toString(),
      );
      otherUsers.map(async el => {
        const ouser = await User.findById(el);
        // if (ouser.notificationTokens.length > 0) {
        //   sendNotification(
        //     `${chatRoomDb.name}: ${user.firstName} ${user.lastName}`,
        //     messagePayload,
        //     user.profileImage || '',
        //     ouser.notificationTokens,
        //     'groupChat',
        //     roomId,
        //     {
        //       groupName: chatRoomDb.name,
        //       userIds: otherUsers.join('-'),
        //     },
        //   );
        // }
      });
      await post.save();
      const postwithImage = await ChatMessageModel.findById(post._id).populate(
        'postedByUser',
        'firstName lastName profileImage',
      );
      io.to(roomId).emit('newMessageGroup', { post: postwithImage });
    }
  });

  // message a chat room
  client.on('message', async ({ roomId, messagePayload }) => {
    console.log('new message event called==>');
    const { userId } = users.find(el => el.socketId === client.id);
    console.log('messagePayload', messagePayload);
    if (roomId && messagePayload && userId) {
      const post = new ChatMessage({
        chatRoomId: roomId,
        message: messagePayload,
        postedByUser: userId,
      });
      const user = await User.findById(userId);
      const chatRoomDb = await ChatRoom.findById(roomId);
      if (chatRoomDb.userIds[0].toString() == userId) {
        const otherUser = await User.findById(chatRoomDb.chatInitiator);
        // if (otherUser.notificationTokens.length > 0) {
        //   sendNotification(
        //     `${user.firstName} ${user.lastName}`,
        //     messagePayload,
        //     user.profileImage || '',
        //     otherUser.notificationTokens,
        //     'chat',
        //     roomId,
        //     {
        //       firstName: user.firstName.toString(),
        //       lastName: user.lastName.toString(),
        //       picture: user?.profileImage?.toString() || '',
        //       userId: user._id.toString(),
        //     },
        //   );
        // }
      } else {
        const otherUser = await User.findById(chatRoomDb.userIds[0]);
        // if (otherUser.notificationTokens.length > 0) {
        //   sendNotification(
        //     `${user.firstName} ${user.lastName}`,
        //     messagePayload,
        //     user.profileImage || '',
        //     otherUser.notificationTokens,
        //     'chat',
        //     roomId,
        //     {
        //       firstName: user.firstName.toString(),
        //       lastName: user.lastName.toString(),
        //       picture: user?.profileImage?.toString() || '',
        //       userId: user._id.toString(),
        //     },
        //   );
        // }
      }
      // chatRoomDb.userIds.forEach(async el => {
      //   const otherUser = await User.findById(el);
      //   sendNotification(
      //     `${user.firstName} ${user.lastName}`,
      //     messagePayload,
      //     user.profileImage || '',
      //     otherUser.notificationTokens,
      //   );
      //   console.log(otherUser.notificationTokens);
      // });
      await post.save();
      io.to(roomId).emit('new message', { post });
    }
  });

  client.on('markUnread', async ({ roomId }) => {
    await ChatMessageModel.updateMany(
      {
        chatRoomId: roomId,
      },
      { read: true },
    );
  });
});

server.listen(port, () => console.log(`Listning on portt ${port}...`));
