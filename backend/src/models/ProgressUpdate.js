const mongoose = require('mongoose');

const progressUpdateSchema = new mongoose.Schema({
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  milestoneIndex: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  evidenceUrls: {
    type: [String],
    default: []
  },
  progressPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  requestedAmount: {
    type: String
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'released'],
    default: 'submitted'
  },
  releaseTxHash: String,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNote: String
}, {
  timestamps: true
});

progressUpdateSchema.index({ escrow: 1, createdAt: -1 });
progressUpdateSchema.index({ project: 1, milestoneIndex: 1 });
progressUpdateSchema.index({ status: 1 });

module.exports = mongoose.model('ProgressUpdate', progressUpdateSchema);
