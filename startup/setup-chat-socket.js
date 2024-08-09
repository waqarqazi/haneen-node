// socket.js
const ChatRoom = require('../models/ChatRoom'); // Adjust the path according to your project structure
const ChatMessageModel = require('../models/ChatMessage'); // Adjust the path according to your project structure
const User = require('../models/User'); // Adjust the path according to your project structure

let users = [];

const setupChatSocket = io => {
  io.on('connection', client => {
    console.log('A user is connected with io ');
    // add identity of user mapped to the socket id
    client.on('identity', async ({ userId }) => {
      console.log('userId', userId);
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
      async ({ otherUserId = [], name, picture, description }) => {
        console.log('otherUserId', otherUserId);
        console.log('new create event called');
        const { userId } = users.find(el => el.socketId === client.id);
        if (otherUserId.length > 0 && userId) {
          const { chatRoomId, isNew, message } = await ChatRoom.initiateChat(
            [...otherUserId],
            userId,
            name,
            picture,
            description,
          );
          console.log(chatRoomId, 'chatroomId');
          const userSockets = users.filter(
            user => user.userId === otherUserId[0],
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

    // message a chat room
    client.on('message', async ({ roomId, messagePayload }) => {
      console.log('new message event called');
      const { userId } = users.find(el => el.socketId === client.id);
      if (roomId && messagePayload && userId) {
        const post = new ChatMessageModel({
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
};

module.exports = setupChatSocket;
