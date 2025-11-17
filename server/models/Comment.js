const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
commentSchema.index({ createdAt: -1 });
commentSchema.index({ userId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
