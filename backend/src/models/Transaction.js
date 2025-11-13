const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['donation', 'reward'],
    required: true
  },
  amount: {
    type: String, // Amount in XLM for donations, tokens for rewards
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  txHash: {
    type: String, // Soroban transaction hash
    required: true
  },
  sorobanResponse: {
    type: Object, // Store full Soroban transaction response
    required: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
transactionSchema.index({ from: 1, type: 1 });
transactionSchema.index({ to: 1, type: 1 });
transactionSchema.index({ project: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);