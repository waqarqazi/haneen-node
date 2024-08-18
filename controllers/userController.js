/* eslint-disable */
const Media = require('../models/Media.js');
const Like = require('../models/Like.js');
const SuperLike = require('../models/SuperLike.js');
const Match = require('../models/Match.js');
const Skip = require('../models/SkipUser.js');
const User = require('../models/User.js');
const ErrorResponse = require('../utils/errorResponse.js');
const { calculateAge, generateUniqueUsername } = require('../utils/helpers.js');
const { s3Bucket } = require('../config/aws.js');

const getDistance = (location1, location2) => {
  const { latitude: lat1, longitude: lon1 } = location1;
  const { latitude: lat2, longitude: lon2 } = location2;

  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};
const getMatchingInterestsCount = (userInterests, matchInterests) => {
  return userInterests.filter(interest => matchInterests.includes(interest))
    .length;
};

// Get all users Formatch
const getAllUsersForMatch = async (req, res, next) => {
  const userId = req.body.user._id;
  const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Find users liked by the current user
    const likedUsers = await Like.find({ userId: userId }).select(
      'likedUserId',
    );
    const likedUserIds = likedUsers.map(like => like.likedUserId.toString());

    // Find users liked by the current user
    const superLikedUsers = await SuperLike.find({ userId: userId }).select(
      'superLikedUserId',
    );
    const superLikedUserIds = superLikedUsers.map(like =>
      like.superLikedUserId.toString(),
    );

    // Find users skipped by the current user
    const skippedUsers = await Skip.find({ userId: userId }).select(
      'skippedUserId',
    );
    const skippedUserIds = skippedUsers.map(skip =>
      skip.skippedUserId.toString(),
    );
    console.log(`Skipped users: ${skippedUserIds}`);

    // Find users who have matched with the current user
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).select('user1 user2');
    const matchedUserIds = matches.reduce((acc, match) => {
      if (match.user1.toString() !== userId) acc.push(match.user1.toString());
      if (match.user2.toString() !== userId) acc.push(match.user2.toString());
      return acc;
    }, []);

    console.log(`Matched users: ${matchedUserIds}`);

    // Log the user's preferences
    console.log(`User's preferences: ${JSON.stringify(user.preferences)}`);

    // Count total potential matches
    const totalPotentialMatches = await User.countDocuments({
      _id: {
        $ne: userId,
        $nin: [
          ...skippedUserIds,
          ...likedUserIds,
          ...superLikedUserIds,
          ...matchedUserIds,
        ],
      },
      gender: user.preferences.preferred_gender,
      basicProfileStatus: true,
    });

    console.log(`Total potential matches: ${totalPotentialMatches}`);

    // Find potential matches with pagination
    const users = await User.find({
      _id: {
        $ne: userId,
        $nin: [
          ...skippedUserIds,
          ...likedUserIds,
          ...superLikedUserIds,
          ...matchedUserIds,
        ],
      },
      gender: user.preferences.preferred_gender,
      basicProfileStatus: true,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // .lean() to get plain JS object

    users.forEach(u => {
      u.age = calculateAge(u.dob);
      if (user.location && u.location) {
        u.distance = getDistance(user.location, u.location);
      } else {
        u.distance = null; // or some default value if location is missing
      }
      u.matchingInterestsCount = getMatchingInterestsCount(
        user.preferences.preferred_interests,
        u.interests,
      ); // Calculate matching interests
    });

    console.log(`Paginated matches: ${users.length}`);

    // Populate media for potential matches
    const populatedMatches = await Promise.all(
      users.map(async match => {
        const media = await Media.findOne({ user: match._id }, 'mediaItems');
        return { ...match, mediaItems: media ? media.mediaItems : [] };
      }),
    );

    console.log(`Populated matches: ${populatedMatches.length}`);

    if (populatedMatches.length === 0) {
      return res.status(404).json({ message: 'No matches found' });
    }

    // Sort matches by distance, then age, then matching interests count
    populatedMatches.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      } else if (a.age !== b.age) {
        return a.age - b.age;
      } else {
        return b.matchingInterestsCount - a.matchingInterestsCount;
      }
    });

    res.json({
      totalMatches: totalPotentialMatches,
      totalPages: Math.ceil(totalPotentialMatches / limit),
      currentPage: parseInt(page),
      matches: populatedMatches,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};
// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const total = await User.countDocuments();
    const users = await User.find();
    res.status(200).json({ total: total, data: users });
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve users', 500));
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Get user by ID
const getProfile = async (req, res, next) => {
  const userId = req.body.user._id;
  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find the media associated with the user
    const media = await Media.findOne({ user: userId });
    // Return the user information along with the associated media items (images)
    return res.json({
      user,
      mediaItems: media ? media.mediaItems : [], // Return an empty array if no media is found
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

// Create a new user
const createUser = async (req, res, next) => {
  try {
    const prevUser = await User.findOne({ username: req.body.username });
    if (prevUser) {
      return res.status(401).json({ error: 'UserName Already Exist' });
    }
    const prevUserEmail = await User.findOne({ email: req.body.email });
    if (prevUserEmail) {
      return res.status(401).json({ error: 'Email Already Exist' });
    }
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error });
  }
};

// Update a user
const updateUser = async (req, res, next) => {
  const { first_name, last_name, preferences, profilePicture } = req.body;
  const userId = req.body.user._id;
  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    // user.profilePicture = profilePicture || user.profilePicture;
    if (profilePicture) {
      if (!profilePicture.startsWith('data:image')) {
        return res.status(400).json({ error: 'profileImage is not correct' });
      }
      const buf = Buffer.from(
        profilePicture.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
      );

      if (user.profileImage) {
        const data = {
          Key: user.profileImage,
          Body: buf,
          ContentEncoding: 'base64',
          ContentType: 'image/jpeg',
        };
        const params = { Bucket: 'haneen', Key: data.Key };
        await s3Bucket.deleteObject(params).promise();
      }
      const uniqueNumber = await generateUniqueUsername('image');
      const data = {
        Key: `${userId}-profile-photo-${uniqueNumber}`,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
      };

      // const params = { Bucket: 'casaverse-app', Key: data.Key };

      // await s3Bucket.deleteObject(params).promise();

      s3Bucket.upload(data, async (err, uploadData) => {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${uploadData.Location}`);
        user.profilePicture = uploadData.Location;
        await user.save();
      });
    }
    if (preferences) {
      const { preferred_distance, preferred_age_range, preferred_gender } =
        preferences;
      if (preferred_gender !== undefined) {
        user.preferences.preferred_gender = preferred_gender;
      }
      if (preferred_distance !== undefined) {
        user.preferences.preferred_distance = preferred_distance;
      }

      if (
        preferred_age_range !== undefined &&
        Array.isArray(preferred_age_range) &&
        preferred_age_range.length === 2
      ) {
        user.preferences.preferred_age_range = preferred_age_range;
      }
    }

    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    console.log('error', err);
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a user
const deleteUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();
    res.json({ msg: 'User removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  getAllUsersForMatch,
};
