const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      selected: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model('Question', questionSchema);
