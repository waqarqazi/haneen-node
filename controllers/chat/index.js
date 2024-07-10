/* eslint-disable */
const ChatRoomModel = require('../../models/ChatRoom');
const ChatMessageModel = require('../../models/ChatMessage');
const { User } = require('../../models/User');
const ChatRoom = require('../../models/ChatRoom');
const { generatePromoCode } = require('../auth/helper');
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
const getConversationByRoomId = async (req, res) => {
  try {
    let { roomId } = req.params;
    let room = await ChatRoomModel.getChatRoomByRoomId(roomId);

    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'No room exists for this id',
      });
    }
    const users = await User.find({ _id: { $in: room.userIds } }).select(
      '-password -dob -gender -__v -notificationTokens -otp',
    );
    const conversation = await ChatMessageModel.find({
      chatRoomId: roomId,
    })
      .populate('postedByUser', 'firstName lastName profileImage')
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

    return res.status(200).json({
      success: true,
      conversationInfo,
      conversation,
      users,
      room,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const getAllChatList = async (req, res) => {
  let { search } = req.query;
  // let { page, limit } = req.query;
  // if (!page || page == 0) {
  //   page = 1;
  // }
  // if (!limit || limit == 0) {
  //   limit = 10;
  // }
  // page -= 1;

  let allConversation = await ChatRoomModel.find({
    $or: [
      { userIds: { $in: [req.user.userId] } },
      { chatInitiator: req.user.userId },
    ],
    userIds: { $size: 1 },
  });
  // let allConversation1 = await ChatRoomModel.aggregate([
  //   {
  //     $match: {
  //       $or: [
  //         { userIds: { $in: [req.user.userId] } },
  //         { chatInitiator: mongoose.Types.ObjectId(req.user.userId) },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'chatInitiator',
  //       foreignField: '_id',
  //       as: 'chatInitiator',
  //     },
  //   },
  //   { $unwind: '$userIds' },
  //   {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'userIds',
  //       foreignField: '_id',
  //       as: 'userIds',
  //     },
  //   },
  // ]);
  // .skip(page * limit)
  // .limit(limit);

  // return res.send(allConversation);+

  if (!allConversation) {
    return res.json({ error: 'No Chat Found' });
  }
  let secondUser = '';
  allConversation = await Promise.all(
    allConversation.map(async el => {
      el = el?.toObject();
      if (el.name) {
        el.type = 'group';
      } else {
        el.type = 'private';
      }
      if (el.type === 'private') {
        if (req.user.userId === el.chatInitiator.toString()) {
          secondUser = el.userIds[0];
          const user = await User.findById(secondUser);
          el.picture = user?.profileImage || '';
          el.firstName = user?.firstName || '';
          el.lastName = user?.lastName || '';
          el.secondUserId = user?._id || '';
        } else if (req.user.userId === el.userIds[0]) {
          const user = await User.findById(el.chatInitiator);
          el.picture = user?.profileImage || '';
          el.firstName = user?.firstName || '';
          el.lastName = user?.lastName || '';
          el.secondUserId = user?._id || '';
        }
      }
      return el;
    }),
  );
  allConversation = (
    await Promise.all(
      allConversation.map(async el => {
        const messages = await ChatMessageModel.find({
          chatRoomId: el._id,
        }).count();
        return messages && el;
      }),
    )
  ).filter(e => e);

  allConversation = await Promise.all(
    allConversation.map(async el => {
      el.lastMessage = await ChatMessageModel.findOne({
        chatRoomId: el._id,
      }).sort('-createdAt');
      el.unreadCount = await ChatMessageModel.find({
        chatRoomId: el._id,
        read: false,
      }).count();
      return el;
    }),
  );

  let totalChatList = await ChatRoomModel.find({
    $or: [
      { userIds: { $in: [req.user.userId] } },
      { chatInitiator: req.user.userId },
    ],
  }).count();

  // it will be used for pagination
  // const calcPage = totalChatList / limit;
  // totalPages: Math.ceil(+calcPage)
  if (search) {
    allConversation = allConversation.filter(el => {
      if (
        el.firstName.toLowerCase().includes(search.toLowerCase()) ||
        el.lastName.toLowerCase().includes(search.toLowerCase())
      ) {
        return true;
      }
      return false;
    });
  }
  res.json(allConversation);
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
    members.push(req.user.userId);
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
    chatInitiator: req.user.userId,
    name,
    ...(picture && { picture }),
    ...(description && { description }),
  });
  return res.json({ chatRoomId: newGroup._id });
};

const getChatGroups = async (req, res) => {
  const { search = '' } = req.query;
  const chatGroups = await ChatRoom.find({
    userIds: req.user.userId,
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
  getConversationByRoomId,
  getAllChatList,
  markRead,
  createGroup,
  getChatGroups,
  editGroup,
  leaveGroup,
};
