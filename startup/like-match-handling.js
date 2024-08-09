const Like = require('../models/Like');
const SuperLike = require('../models/SuperLike');
const Match = require('../models/Match');
const Skip = require('../models/SkipUser');
const { ActionHistory } = require('../models/ActionHistory.js');
const ChatRoom = require('../models/ChatRoom.js');

let users = [];
const initiateChatRoomForMatch = async (io, userId, matchedUserId) => {
  try {
    const chatRoom = await ChatRoom.initiateChat(
      [userId, matchedUserId],
      userId,
    );
    const chatRoomId = chatRoom.chatRoomId;

    // Notify both users to join the chat room
    const userSockets = users.filter(
      user => user.userId === userId || user.userId === matchedUserId,
    );

    userSockets.forEach(userInfo => {
      const socketConn = io.sockets.sockets.get(userInfo.socketId);
      if (socketConn) {
        socketConn.join(chatRoomId);
      }
    });

    io.to(chatRoomId).emit('OnJoin', {
      message: `You have matched with a new user!`,
      chatRoomId,
      isNew: chatRoom.isNew,
    });

    console.log(
      `Chat room initiated for match between User ${userId} and User ${matchedUserId}`,
    );
  } catch (error) {
    console.error('Error initiating chat room for match:', error);
  }
};

const likeMatchHandling = io => {
  const likesNamespace = io.of('/likes');

  likesNamespace.on('connection', client => {
    console.log('A user connected to the likes namespace');

    // Skip Handling
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
          likesNamespace.emit('skip', 'Already Skipped');
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

    // Like Handling
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

          // client.join(userId.toString());
          // client.join(likedUserId.toString());

          likesNamespace
            .to(userId.toString())
            .emit('match', { user1: userId, user2: likedUserId });
          likesNamespace
            .to(likedUserId.toString())
            .emit('match', { user1: userId, user2: likedUserId });
          console.log('Match');
          await initiateChatRoomForMatch(io, userId, likedUserId);
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Super Like Handling
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
          const newMatch = new Match({
            user1: userId,
            user2: superLikedUserId,
          });
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
          await initiateChatRoomForMatch(io, userId, superLikedUserId);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
};

module.exports = likeMatchHandling;
