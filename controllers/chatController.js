/* eslint-disable */
const ChatMessageModel = require('../models/ChatMessage');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const { generatePromoCode } = require('./auth/helper');
const ChatMessage = require('../models/ChatMessage');
//const { s3Bucket } = require('../../config/aws');
// Create a new chat room
const createChatRoom = async (req, res) => {
  const { userIds, chatInitiator, name, picture, description } = req.body;

  try {
    const result = await ChatRoom.initiateChat(
      userIds,
      chatInitiator,
      name,
      picture,
      description,
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// Get all chat rooms
const getAllChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find().populate(
      'chatInitiator',
      'firstName lastName profileImage',
    );
    res.status(200).json({
      success: true,
      chatRooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching chat rooms.',
      error: error.message,
    });
  }
};
const createMessage = async (req, res) => {
  const { chatRoomId, message, postedByUser } = req.body;

  if (!chatRoomId || !message || !postedByUser) {
    return res
      .status(400)
      .json({ message: 'chatRoomId, message, and postedByUser are required' });
  }

  try {
    const newMessage = await ChatMessage.createPostInChatRoom(
      chatRoomId,
      message,
      postedByUser,
    );
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getAllMessages = async (req, res) => {
  const { chatRoomId } = req.params;

  if (!chatRoomId) {
    return res.status(400).json({ message: 'chatRoomId is required' });
  }

  try {
    const messages = await ChatMessage.find({ chatRoomId }).populate(
      'postedByUser',
    );
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const getConversationByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Get the chat room by ID
    const room = await ChatRoom.getChatRoomByRoomId(roomId);
    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'No room exists for this id',
      });
    }

    // Get users in the chat room
    const users = await User.find({ _id: { $in: room.userIds } }).select(
      'username _id gender',
    );
    if (!users) {
      return res.status(404).json({
        success: false,
        message: 'Users not found',
      });
    }

    // Get the conversation messages
    const conversation = await ChatMessageModel.find({ chatRoomId: roomId })
      .populate('postedByUser', 'first_name last_name profile_picture')
      .select('-chatRoomId -__v');

    const conversationInfo = {};
    if (room.name) {
      conversationInfo.type = 'group';
      if (room.picture) {
        conversationInfo.picture = room.picture;
      }
    } else {
      conversationInfo.type = 'private';
      conversationInfo.picture = users[0]?.profileImage || '';
    }

    // Return the conversation details
    return res.status(200).json({
      success: true,
      conversationInfo,
      conversation,
      users,
      room,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllChatList = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.body.user._id;

    // Fetch all conversations involving the user
    let allConversation = await ChatRoom.find({
      $or: [{ userIds: userId }, { chatInitiator: userId }],
    });

    if (!allConversation.length) {
      return res.json({ error: 'No Chat Found' });
    }

    allConversation = await Promise.all(
      allConversation.map(async el => {
        el = el?.toObject();
        const secondUserId =
          el.chatInitiator.toString() === userId
            ? el.userIds[0]
            : el.chatInitiator;
        const user = await User.findById(secondUserId);
        el.picture = user?.profile_picture || '';
        el.firstName = user?.first_name || '';
        el.lastName = user?.last_name || '';
        el.secondUserId = user?._id || '';
        return el;
      }),
    );

    allConversation = (
      await Promise.all(
        allConversation.map(async el => {
          const messagesCount = await ChatMessageModel.countDocuments({
            chatRoomId: el._id,
          });
          return messagesCount ? el : null;
        }),
      )
    ).filter(e => e);

    allConversation = await Promise.all(
      allConversation.map(async el => {
        el.lastMessage = await ChatMessageModel.findOne({
          chatRoomId: el._id,
        }).sort('-createdAt');
        el.unreadCount = await ChatMessageModel.countDocuments({
          chatRoomId: el._id,
          read: false,
        });
        return el;
      }),
    );

    // const totalChatList = await ChatRoom.countDocuments({
    //   $or: [
    //     { userIds: { $in: [userId] } },
    //     { chatInitiator: userId },
    //   ],
    // });

    if (search) {
      allConversation = allConversation.filter(el => {
        return (
          el.first_name.toLowerCase().includes(search.toLowerCase()) ||
          el.lastName.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    res.json(allConversation);
  } catch (error) {
    console.error('Error fetching chat list', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const markRead = async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) {
    return res.status(404).json({ success: false });
  }
  await ChatMessageModel.updateMany(
    {
      chatRoomId: roomId,
    },
    { read: true },
    { upsert: true },
  );
  return res.send({ success: true });
};

const createGroup = async (req, res) => {
  let { name, picture, description, members } = req.body;
  if (!name) {
    return res.json({ error: 'Group name is required field' });
  }
  if (members?.length > 0) {
    members.push(req.body.user._id);
  }
  if (!(members?.length >= 2)) {
    return res.json({ error: 'minimum 2 members required for group creation' });
  }
  //   if (picture) {
  //     const uniqueNumber = await generatePromoCode();
  //     const buf = Buffer.from(
  //       picture.replace(/^data:image\/\w+;base64,/, ''),
  //       'base64',
  //     );
  //     const data = {
  //       Key: `group-${Math.floor(Math.random() * 1000000)}-photo-${uniqueNumber}`,
  //       Body: buf,
  //       ContentEncoding: 'base64',
  //       ContentType: 'image/jpeg',
  //     };
  //     s3Bucket.upload(data, async (err, uploadData) => {
  //       if (err) {
  //         throw err;
  //       }
  //       console.log(`File uploaded successfully. ${uploadData.Location}`);
  //       picture = uploadData.Location;
  //     });
  //   }
  const newGroup = await ChatRoom.create({
    userIds: members,
    chatInitiator: req.body.user._id,
    name,
    ...(picture && { picture }),
    ...(description && { description }),
  });
  return res.json({ chatRoomId: newGroup._id });
};

const getChatGroups = async (req, res) => {
  const { search = '' } = req.query;
  const chatGroups = await ChatRoom.find({
    userIds: req.body.user._id,
    'userIds.1': { $exists: true },
    name: { $regex: search, $options: 'i' },
  }).populate({
    path: 'userIds',
    model: 'User',
    select: 'profileImage firstName lastName userName',
  });
  return res.send(chatGroups);
};

const editGroup = async (req, res) => {
  const { chatRoomId, name, description, members, picture } = req.body;
  const uniqueNumber = await generatePromoCode();
  if (chatRoomId) {
    const room = await ChatRoom.findOne({ _id: chatRoomId });
    room.name = name || room.name || '';
    room.description = description || room.description || '';
    room.userIds = members || room.userIds;
    if (picture) {
      const buf = Buffer.from(
        picture.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
      );
      const data = {
        Key:
          room.picture ||
          `group-${Math.floor(Math.random() * 1000000)}-photo-${uniqueNumber}`,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
      };
      const uploadData = await s3Bucket.upload(data).promise();
      room.picture = uploadData.Location;
      console.log(`File uploaded successfully. ${uploadData.Location}`);
    }
    await room.save();
    res.json({ success: true, room });
  }
};

const leaveGroup = async (req, res) => {
  const { roomId } = req.body;
  const { userId } = req.user;
  let room = await ChatRoom.findById(roomId);
  room.userIds = room.userIds.filter(el => el !== userId);
  if (room.userIds.length < 1) {
    await ChatRoom.findOneAndRemove(roomId);
    return res.send({ success: true, message: 'Group Deleted' });
  }
  room.chatInitiator = room.userIds[0];
  await room.save();
  return res.send({ success: true, message: 'Group leave' });
};

module.exports = {
  createChatRoom,
  getAllChatRooms,
  createMessage,
  getConversationByRoomId,
  getAllChatList,
  markRead,
  createGroup,
  getChatGroups,
  editGroup,
  leaveGroup,
  getAllMessages,
};
