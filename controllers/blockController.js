const Block = require('../models/Block');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all blocks
const getAllBlocks = async (req, res) => {
  try {
    const blocks = await Block.find();
    res.json(blocks);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Get block by ID
const getBlockById = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) {
      return res.status(404).json({ msg: 'Block not found' });
    }
    res.json(block);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new block
const createBlock = async (req, res) => {
  const { user_id, blocked_user_id } = req.body;

  try {
    let block = new Block({
      user_id,
      blocked_user_id,
    });

    await block.save();
    res.json(block);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Update a block
const updateBlock = async (req, res) => {
  const { blocked_user_id } = req.body;

  try {
    let block = await Block.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ msg: 'Block not found' });
    }

    block.blocked_user_id = blocked_user_id || block.blocked_user_id;

    await block.save();
    res.json(block);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a block
const deleteBlock = async (req, res) => {
  try {
    let block = await Block.findById(req.params.id);

    if (!block) {
      return res.status(404).json({ msg: 'Block not found' });
    }

    await block.remove();
    res.json({ msg: 'Block removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllBlocks,
  getBlockById,
  createBlock,
  updateBlock,
  deleteBlock,
};
