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
    enum: [
      'draft',
      'kyc_pending',
      'kyc_verified',
      'auto_review_failed',
      'manual_review_pending',
      'approved_for_funding',
      'active',
      'funded',
      'completed',
      'rejected',
      'cancelled'
    ],
    default: 'draft'
  },
  imageUrl: String,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
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
  },
  verification: {
    profileType: {
      type: String,
      enum: ['individual', 'organization'],
      default: 'individual'
    },
    kyc: {
      status: {
        type: String,
        enum: ['not_submitted', 'pending', 'verified', 'rejected'],
        default: 'not_submitted'
      },
      documents: {
        type: [String],
        default: []
      },
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    },
    autoReview: {
      passed: {
        type: Boolean,
        default: false
      },
      score: {
        type: Number,
        default: 0
      },
      reasons: {
        type: [String],
        default: []
      },
      checkedAt: Date
    },
    manualReview: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    },
    timeline: {
      type: [
        {
          stage: String,
          by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          },
          at: {
            type: Date,
            default: Date.now
          },
          note: String
        }
      ],
      default: []
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);