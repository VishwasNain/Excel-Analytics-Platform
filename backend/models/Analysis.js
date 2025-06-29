const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  charts: [{
    type: {
      type: String,
      required: true
    },
    xColumn: {
      type: String,
      required: true
    },
    yColumn: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  }],
  insights: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);
