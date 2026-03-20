const mongoose = require('mongoose');

const videoPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 160
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  platform: {
    type: String,
    enum: ['youtube', 'vimeo'],
    required: true
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  embedUrl: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

videoPostSchema.index({ status: 1, createdAt: -1 });
videoPostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('VideoPost', videoPostSchema);
