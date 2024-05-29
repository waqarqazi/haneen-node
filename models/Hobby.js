const mongoose = require('mongoose');

const hobbySchema = new mongoose.Schema({
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

module.exports = mongoose.model('Hobby', hobbySchema);
