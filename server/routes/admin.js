const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Certificate = require('../models/Certificate')
const PasswordResetRequest = require('../models/PasswordResetRequest')
const { adminAuth } = require('../middleware/auth')
const SystemLogger = require('../utils/logger')

const router = express.Router()

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' })
  }
})

// Update user status
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body
    
    // Lấy thông tin user trước khi cập nhật
    const oldUser = await User.findById(req.params.id).select('-password')
    if (!oldUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password')

    // Lưu log thay đổi trạng thái
    const SystemLog = require('../models/SystemLog')
    const statusLog = new SystemLog({
      type: isActive ? 'account_unlock' : 'account_lock',
      adminId: req.userId,
      adminName: req.user?.fullName || 'Admin',
      targetUserId: user._id,
      targetUserName: user.fullName,
      targetUserEmail: user.email,
      message: `Admin đã ${isActive ? 'mở khóa' : 'khóa'} tài khoản ${user.fullName} (${user.email})`,
      details: {
        previousStatus: oldUser.isActive ? 'active' : 'locked',
        newStatus: isActive ? 'active' : 'locked',
        reason: isActive ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
        additionalInfo: {
          actionTime: new Date().toISOString()
        }
      },
      severity: isActive ? 'medium' : 'high'
    })

    await statusLog.save()

    res.json({ 
      message: `${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`,
      user,
      logId: statusLog._id
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái người dùng' })
  }
})

// Delete user account (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id
    
    // Prevent admin from deleting themselves
    if (userId === req.userId.toString()) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }

    // Prevent deleting other admin accounts
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể xóa tài khoản admin khác' })
    }

    // Delete all certificates associated with this user
    const deletedCertificates = await Certificate.deleteMany({ userId })
    
    // Lưu log trước khi xóa user
    const SystemLog = require('../models/SystemLog')
    const deleteLog = new SystemLog({
      type: 'user_delete',
      adminId: req.userId,
      adminName: req.user?.fullName || 'Admin',
      targetUserId: user._id,
      targetUserName: user.fullName,
      targetUserEmail: user.email,
      message: `Admin đã xóa tài khoản ${user.fullName} (${user.email})`,
      details: {
        reason: 'Xóa tài khoản người dùng',
        previousStatus: user.isActive ? 'active' : 'locked',
        additionalInfo: {
          deletedCertificatesCount: deletedCertificates.deletedCount,
          userRole: user.role,
          deleteTime: new Date().toISOString()
        }
      },
      severity: 'critical'
    })

    await deleteLog.save()
    
    // Delete the user
    await User.findByIdAndDelete(userId)

    res.json({ 
      message: 'Xóa tài khoản thành công',
      deletedUser: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      },
      deletedCertificatesCount: deletedCertificates.deletedCount,
      logId: deleteLog._id
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Lỗi khi xóa tài khoản người dùng' })
  }
})

// Get system statistics
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const totalCertificates = await Certificate.countDocuments()
    const completedCertificates = await Certificate.countDocuments({ processingStatus: 'completed' })
    const failedCertificates = await Certificate.countDocuments({ processingStatus: 'failed' })

    // Get today's processed certificates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayProcessed = await Certificate.countDocuments({
      createdAt: { $gte: today }
    })

    // Get certificates by type
    const certificatesByType = await Certificate.aggregate([
      { $match: { processingStatus: 'completed' } },
      { $group: { _id: '$certificateType', count: { $sum: 1 } } }
    ])

    // Get processing success rate
    const successRate = totalCertificates > 0 
      ? Math.round((completedCertificates / totalCertificates) * 100) 
      : 0

    res.json({
      statistics: {
        totalUsers,
        activeUsers,
        totalCertificates,
        completedCertificates,
        failedCertificates,
        todayProcessed,
        successRate,
        certificatesByType
      }
    })
  } catch (error) {
    console.error('Get statistics error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy thống kê hệ thống' })
  }
})

// Get system logs
router.get('/logs', adminAuth, async (req, res) => {
  try {
    const SystemLog = require('../models/SystemLog')
    
    // Lấy logs từ database
    const logs = await SystemLog.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .select('-__v')

    // Format logs để hiển thị
    const formattedLogs = logs.map(log => ({
      id: log._id,
      timestamp: log.createdAt,
      type: log.type,
      message: log.message,
      adminName: log.adminName,
      targetUserName: log.targetUserName,
      targetUserEmail: log.targetUserEmail,
      details: log.details,
      severity: log.severity
    }))

    res.json({ logs: formattedLogs })
  } catch (error) {
    console.error('Get logs error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy nhật ký hệ thống' })
  }
})

// Get all certificates (admin only)
router.get('/certificates', adminAuth, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(100) // Limit to recent 100 certificates

    res.json({ certificates })
  } catch (error) {
    console.error('Get all certificates error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách chứng chỉ' })
  }
})

// Get all password reset requests (admin only)
router.get('/password-reset-requests', adminAuth, async (req, res) => {
  try {
    const { status } = req.query
    
    let query = {}
    if (status) {
      query.status = status
    }

    const requests = await PasswordResetRequest.find(query)
      .populate('userId', 'fullName email')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 })

    res.json({ 
      success: true,
      requests,
      total: requests.length
    })
  } catch (error) {
    console.error('Get password reset requests error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu cầu' })
  }
})

// Approve password reset request (admin only)
router.post('/password-reset-requests/:id/approve', adminAuth, async (req, res) => {
  try {
    const { reviewNote } = req.body
    const requestId = req.params.id

    console.log('📝 Approve request:', { requestId, reviewNote })

    const request = await PasswordResetRequest.findById(requestId)
      .populate('userId', 'fullName email')

    if (!request) {
      console.log('❌ Request not found:', requestId)
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu' })
    }

    console.log('✅ Request found:', request)

    if (request.status !== 'pending') {
      console.log('❌ Request already processed:', request.status)
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý trước đó' })
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: request.userId._id, purpose: 'reset-password', requestId: request._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    console.log('🔑 Token generated')

    // Update request
    request.status = 'approved'
    request.reviewedAt = new Date()
    request.reviewedBy = req.userId
    request.reviewNote = reviewNote || 'Đã phê duyệt'
    request.resetToken = resetToken
    request.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await request.save()
    console.log('💾 Request saved')

    // Log approval
    try {
      await SystemLogger.log({
        type: 'password_reset_approved',
        message: `Admin phê duyệt yêu cầu đặt lại mật khẩu cho ${request.fullName}`,
        adminId: req.userId,
        adminName: req.user?.fullName || 'Admin',
        targetUserId: request.userId._id,
        targetUserName: request.fullName,
        targetUserEmail: request.email,
        details: {
          requestId: request._id,
          reviewNote: reviewNote || 'Đã phê duyệt',
          tokenExpiresAt: request.tokenExpiresAt
        },
        severity: 'medium'
      })
      console.log('📋 Log saved')
    } catch (logError) {
      console.error('❌ Log error:', logError)
      // Continue even if logging fails
    }

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log('🔗 Reset link:', resetLink)

    // Send email to user with reset link
    const { sendResetPasswordEmail } = require('../utils/email')
    try {
      const emailResult = await sendResetPasswordEmail(request.email, resetLink, request.fullName)
      if (emailResult.success) {
        console.log(`✅ Đã gửi email đặt lại mật khẩu đến ${request.email}`)
      } else {
        console.error('❌ Lỗi gửi email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('❌ Lỗi gửi email:', emailError.message)
      // Continue even if email fails
    }

    res.json({ 
      success: true,
      message: 'Đã phê duyệt yêu cầu và gửi email đến người dùng',
      request,
      resetLink
    })
  } catch (error) {
    console.error('❌ Approve password reset error:', error)
    res.status(500).json({ 
      message: 'Lỗi khi phê duyệt yêu cầu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Reject password reset request (admin only)
router.post('/password-reset-requests/:id/reject', adminAuth, async (req, res) => {
  try {
    const { reviewNote } = req.body
    const requestId = req.params.id

    const request = await PasswordResetRequest.findById(requestId)
      .populate('userId', 'fullName email')

    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu đã được xử lý trước đó' })
    }

    // Update request
    request.status = 'rejected'
    request.reviewedAt = new Date()
    request.reviewedBy = req.userId
    request.reviewNote = reviewNote || 'Từ chối yêu cầu'

    await request.save()

    // Log rejection
    await SystemLogger.log({
      type: 'password_reset_rejected',
      message: `Admin từ chối yêu cầu đặt lại mật khẩu cho ${request.fullName}`,
      adminId: req.userId,
      adminName: req.user?.fullName || 'Admin',
      targetUserId: request.userId._id,
      targetUserName: request.fullName,
      targetUserEmail: request.email,
      details: {
        requestId: request._id,
        reviewNote: reviewNote || 'Từ chối yêu cầu'
      },
      severity: 'low'
    })

    res.json({ 
      success: true,
      message: 'Đã từ chối yêu cầu đặt lại mật khẩu',
      request
    })
  } catch (error) {
    console.error('Reject password reset error:', error)
    res.status(500).json({ message: 'Lỗi khi từ chối yêu cầu' })
  }
})

// Get password reset request statistics
router.get('/password-reset-requests/stats', adminAuth, async (req, res) => {
  try {
    const total = await PasswordResetRequest.countDocuments()
    const pending = await PasswordResetRequest.countDocuments({ status: 'pending' })
    const approved = await PasswordResetRequest.countDocuments({ status: 'approved' })
    const rejected = await PasswordResetRequest.countDocuments({ status: 'rejected' })

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected
      }
    })
  } catch (error) {
    console.error('Get password reset stats error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy thống kê' })
  }
})

module.exports = router