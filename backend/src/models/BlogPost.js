const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 180
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 320,
    default: ''
  },
  content: {
    type: String,
    required: true
  },
  coverImageUrl: {
    type: String,
    trim: true,
    default: ''
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
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1, createdAt: -1 });
blogPostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);
