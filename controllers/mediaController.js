/* eslint-disable */
const { s3Bucket } = require('../config/aws.js');
const Media = require('../models/Media.js');
const User = require('../models/User.js');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const uploadImages = async (req, res) => {
  const { images, deleteImages } = req.body;
  const userId = req.body.user._id;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Verify that the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deletedImages = [];
    const invalidIds = [];

    // Delete images from S3 and database if deleteImages array is provided
    if (deleteImages && deleteImages.length > 0) {
      for (const imageId of deleteImages) {
        // Validate the imageId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(imageId)) {
          invalidIds.push(imageId);
          continue;
        }

        // Find the media document containing the image and verify ownership
        const mediaDoc = await Media.findOne({
          'mediaItems._id': imageId,
          user: userId,
        });
        if (mediaDoc) {
          const imageItem = mediaDoc.mediaItems.id(imageId);

          // Delete the image from S3
          const params = {
            Key: imageItem.url.split('/').pop(), // Extract the filename from the URL
          };

          await s3Bucket.deleteObject(params).promise();

          // Remove the image from the media document
          imageItem.remove();
          await mediaDoc.save();

          // Add the deleted image's ID to the deletedImages array
          deletedImages.push(imageId);
        } else {
          invalidIds.push(imageId);
        }
      }
    }

    const mediaItems = [];

    for (const image of images) {
      const { base64Data, mimeType } = image;

      // Generate a unique filename
      const fileName = `${uuidv4()}.${mimeType.split('/')[1]}`;
      console.log('fileName', fileName);

      // Create buffer from base64 string
      const buffer = Buffer.from(base64Data, 'base64');

      // Set S3 upload parameters
      const params = {
        Key: fileName,
        Body: buffer,
        ContentEncoding: 'base64', // Required for base64
        ContentType: mimeType,
      };

      // Upload to S3
      const uploadResult = await s3Bucket.upload(params).promise();
      console.log('uploadResult', uploadResult);

      // Add the uploaded file's URL to mediaItems
      mediaItems.push({
        type: image.type,
        url: uploadResult.Location,
      });
    }

    // Find existing media document or create a new one
    let media = await Media.findOne({ user: userId });

    if (media) {
      // Check if adding the new images will exceed the limit of 10
      const currentImageCount = media.mediaItems.length;
      if (currentImageCount + mediaItems.length > 10) {
        return res.status(400).json({
          success: false,
          message: `Cannot upload images. You have ${currentImageCount} images and you can only add ${
            10 - currentImageCount
          } more.`,
        });
      }

      // If media document exists, append new media items to the existing array
      media.mediaItems.push(...mediaItems);
    } else {
      // If no media document exists, create a new one
      if (mediaItems.length > 10) {
        return res.status(400).json({
          success: false,
          message: `Cannot upload more than 10 images at once.`,
        });
      }

      media = new Media({
        user: userId,
        mediaItems: mediaItems,
      });
    }

    await media.save();

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully!',
      media: media,
      deletedImages:
        deletedImages.length > 0
          ? `Deleted images with IDs: ${deletedImages.join(', ')}`
          : 'No images were deleted',
      invalidIds:
        invalidIds.length > 0
          ? `Invalid or unauthorized IDs: ${invalidIds.join(', ')}`
          : undefined,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error uploading images', error: error.message });
  }
};

const getHobbies = async (req, res) => {
  try {
    const hobbies = await Media.find({}, { __v: 0, _id: 1 });
    res.status(200).json({ success: true, hobbies });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res
        .status(404)
        .send({ message: 'Media not found', success: false });
    }
    res.status(200).json({ success: true, media });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!media) {
      return res
        .status(404)
        .send({ message: 'Media not found', success: false });
    }
    res.status(200).json({ success: true, media });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) {
      return res
        .status(404)
        .send({ message: 'Media not found', success: false });
    }
    res.status(200).json({ success: true, media });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

module.exports = {
  uploadImages,
  getHobbies,
  getMediaById,
  updateMedia,
  deleteMedia,
};
