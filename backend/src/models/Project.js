const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  targetAmount: {
    type: String, // Amount in XLM
    required: true
  },
  currentAmount: {
    type: String, // Amount in XLM
    default: '0'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['renewable-energy', 'recycling', 'conservation', 'sustainable-agriculture', 'clean-water'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'funded', 'completed', 'cancelled'],
    default: 'active'
  },
  imageUrl: String,
  milestones: [{
    description: String,
    targetAmount: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  environmentalImpact: {
    metric: String, // e.g., "CO2 reduction", "Trees planted", etc.
    value: Number,
    unit: String // e.g., "tons", "units", etc.
  },
  tokenRewards: {
    type: String, // Amount of tokens per XLM donated
    default: '1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);