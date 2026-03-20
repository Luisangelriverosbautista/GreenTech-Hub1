const mongoose = require('mongoose');

const escrowMilestoneSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'released', 'disputed'],
    default: 'pending'
  },
  approvedAt: Date,
  releasedAt: Date,
  disputedAt: Date
}, { _id: false });

const escrowSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mode: {
    type: String,
    enum: ['single-release', 'multi-release'],
    default: 'single-release'
  },
  trustlessEscrowId: {
    type: String,
    required: true
  },
  contractId: {
    type: String
  },
  amountTotal: {
    type: String,
    required: true
  },
  amountReleased: {
    type: String,
    default: '0'
  },
  asset: {
    type: String,
    default: 'XLM'
  },
  status: {
    type: String,
    enum: ['draft', 'funded', 'approved', 'partially-released', 'released', 'disputed', 'resolved', 'failed'],
    default: 'funded'
  },
  milestones: {
    type: [escrowMilestoneSchema],
    default: []
  },
  metadata: {
    type: Object,
    default: {}
  },
  trustlessResponse: {
    type: Object,
    default: {}
  },
  lastSyncedAt: Date
}, {
  timestamps: true
});

escrowSchema.index({ project: 1, createdAt: -1 });
escrowSchema.index({ donor: 1, createdAt: -1 });
escrowSchema.index({ creator: 1, createdAt: -1 });
escrowSchema.index({ trustlessEscrowId: 1 }, { unique: true });

module.exports = mongoose.model('Escrow', escrowSchema);
