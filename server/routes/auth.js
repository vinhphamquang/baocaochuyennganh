const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { sendResetPasswordEmail, sendWelcomeEmail } = require('../utils/email')

const router = express.Router()

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, isAdmin } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' })
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      role: isAdmin ? 'admin' : 'user'
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Lỗi server khi đăng ký' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Tài khoản đã bị khóa' })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' })
  }
})

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng' })
  }
})

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email } = req.body

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } })
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' })
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, email },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }

    res.json({ 
      message: 'Cập nhật thông tin thành công',
      user 
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin' })
  }
})

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    }

    // Get user with password
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Đổi mật khẩu thành công' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu' })
  }
})

// Forgot password - Send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email' })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' })
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'reset-password' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    )

    // In production, send email with reset link
    // For now, just log the link
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`
    console.log('Reset password link:', resetLink)
    console.log('For user:', email)

    res.json({ 
      message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
      // Remove this in production
      resetLink: resetLink
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (error) {
      return res.status(400).json({ message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' })
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'reset-password') {
      return res.status(400).json({ message: 'Token không hợp lệ' })
    }

    // Find user
    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Đặt lại mật khẩu thành công' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

module.exports = router