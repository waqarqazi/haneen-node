const Question = require('../models/Question.js');

const createQuestion = async (req, res) => {
  try {
    const hobby = new Question(req.body);
    await hobby.save();
    res.status(201).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const getQuestions = async (req, res) => {
  try {
    const hobbies = await Question.find();
    res.status(200).json({ success: true, hobbies });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const hobby = await Question.findById(req.params.id);
    if (!hobby) {
      return res
        .status(404)
        .send({ message: 'Question not found', success: false });
    }
    res.status(200).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const hobby = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hobby) {
      return res
        .status(404)
        .send({ message: 'Question not found', success: false });
    }
    res.status(200).json({ success: true, hobby });
  } catch (error) {
    console.error('Error:', error);
    res
      .status(500)
      .send({ message: 'Internal server error', error, success: false });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const hobby = await Question.findByIdAndDelete(req.params.id);
    if (!hobby) {
      return res
        .status(404)
        .send({ message: 'Question not found', success: false });
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
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
