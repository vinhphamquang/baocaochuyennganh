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
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }

    res.json({ 
      message: `${isActive ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`,
      user 
    })
  } catch (error) {
    console.error('Update user status error:', error)
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái người dùng' })
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

// Get system logs (mock data for now)
router.get('/logs', adminAuth, async (req, res) => {
  try {
    // In a real application, you would have a proper logging system
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        type: 'info',
        message: 'Hệ thống khởi động thành công'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'warning',
        message: 'OCR API response time cao hơn bình thường'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'error',
        message: 'Lỗi xử lý file certificate_corrupted.pdf'
      }
    ]

    res.json({ logs: mockLogs })
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