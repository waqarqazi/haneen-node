const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController.js');

// Get all blocks
router.get('/', blockController.getAllBlocks);

// Get block by ID
router.get('/:id', blockController.getBlockById);

// Create a new block
router.post('/', blockController.createBlock);

// Update a block
router.put('/:id', blockController.updateBlock);

// Delete a block
router.delete('/:id', blockController.deleteBlock);

module.exports = router;
