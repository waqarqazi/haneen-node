const Hobby = require('../models/Hobby.js');

const createHobby = async (req, res) => {
  try {
    const hobby = new Hobby(req.body);
    await hobby.save();
    res.status(201).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const getHobbies = async (req, res) => {
  try {
    const hobbies = await Hobby.find({}, { __v: 0, _id: 1 });
    res.status(200).json({ success: true, hobbies });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const getHobbyById = async (req, res) => {
  try {
    const hobby = await Hobby.findById(req.params.id);
    if (!hobby) {
      return res
        .status(404)
        .send({ message: 'Hobby not found', success: false });
    }
    res.status(200).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const updateHobby = async (req, res) => {
  try {
    const hobby = await Hobby.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hobby) {
      return res
        .status(404)
        .send({ message: 'Hobby not found', success: false });
    }
    res.status(200).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const deleteHobby = async (req, res) => {
  try {
    const hobby = await Hobby.findByIdAndDelete(req.params.id);
    if (!hobby) {
      return res
        .status(404)
        .send({ message: 'Hobby not found', success: false });
    }
    res.status(200).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

module.exports = {
  createHobby,
  getHobbies,
  getHobbyById,
  updateHobby,
  deleteHobby,
};
