const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    default: 'Quên mật khẩu'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNote: {
    type: String
  },
  resetToken: {
    type: String
  },
  tokenExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
passwordResetRequestSchema.index({ userId: 1, status: 1 });
passwordResetRequestSchema.index({ email: 1 });
passwordResetRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
