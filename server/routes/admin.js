const express = require('express')
const User = require('../models/User')
const Certificate = require('../models/Certificate')
const { adminAuth } = require('../middleware/auth')

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

module.exports = router