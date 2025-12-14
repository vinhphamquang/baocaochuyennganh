const mongoose = require('mongoose')

const systemLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'user_register', 'user_login', 'user_logout', 'user_profile_update',
      'certificate_upload', 'certificate_process', 'certificate_download', 'certificate_delete',
      'comment_create', 'comment_update', 'comment_delete',
      'user_report', 'account_lock', 'account_unlock', 'user_delete',
      'admin_action', 'system_error', 'security_alert',
      'info', 'warning', 'error'
    ],
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return ['user_report', 'account_lock', 'account_unlock', 'user_delete'].includes(this.type)
    }
  },
  adminName: {
    type: String,
    required: function() {
      return ['user_report', 'account_lock', 'account_unlock', 'user_delete'].includes(this.type)
    }
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetUserName: String,
  targetUserEmail: String,
  message: {
    type: String,
    required: true
  },
  details: {
    reason: String,
    commentContent: String,
    commentId: String,
    previousStatus: String,
    newStatus: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true
})

// Index để tìm kiếm nhanh
systemLogSchema.index({ type: 1, createdAt: -1 })
systemLogSchema.index({ adminId: 1, createdAt: -1 })
systemLogSchema.index({ targetUserId: 1, createdAt: -1 })

module.exports = mongoose.model('SystemLog', systemLogSchema)