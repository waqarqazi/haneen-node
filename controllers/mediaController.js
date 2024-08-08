const Media = require('../models/Media.js');

const createMedia = async (req, res) => {
  let userId = req.body.user._id;
  const media = await Media.findByIdAndUpdate(
    userId,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        media: req.body.media,
      },
    },
    { new: true },
  );

  if (!media) {
    return res.status(404).send('Media not found');
  }

  res.send(media);
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
  createMedia,
  getHobbies,
  getMediaById,
  updateMedia,
  deleteMedia,
};
