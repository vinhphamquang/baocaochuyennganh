const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const SystemLogger = require('../utils/logger');

// Lấy tất cả bình luận (public) - không cần duyệt nữa
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .select('-__v');
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bình luận'
    });
  }
});

// Tạo bình luận mới (yêu cầu đăng nhập)
router.post('/', auth.auth, async (req, res) => {
  try {
    const { content, rating } = req.body;

    // Validate
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    // Tạo bình luận mới
    const comment = new Comment({
      userId: req.user._id,
      userName: req.user.fullName,
      userEmail: req.user.email,
      content: content.trim(),
      rating: parseInt(rating)
    });

    await comment.save();

    // Log tạo bình luận
    await SystemLogger.logCommentCreate(req.user, comment, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Bình luận đã được gửi thành công',
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo bình luận',
      error: error.message
    });
  }
});

// Sửa bình luận của chính mình
router.put('/:id', auth.auth, async (req, res) => {
  try {
    const { content, rating } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Chỉ cho phép sửa bình luận của chính mình
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền sửa bình luận này'
      });
    }

    // Validate
    if (content && !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    // Cập nhật bình luận
    if (content) comment.content = content.trim();
    if (rating) comment.rating = parseInt(rating);
    
    await comment.save();

    res.json({
      success: true,
      message: 'Đã cập nhật bình luận',
      data: comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật bình luận'
    });
  }
});

// Xóa bình luận của chính mình
router.delete('/:id', auth.auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Chỉ cho phép xóa bình luận của chính mình hoặc admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Đã xóa bình luận'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa bình luận'
    });
  }
});

// Admin: Lấy tất cả bình luận (bao gồm chưa duyệt)
router.get('/admin/all', auth.auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền xem tất cả bình luận'
      });
    }

    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bình luận'
    });
  }
});

// Admin: Báo cáo tài khoản người dùng
router.post('/:id/report-user', auth.auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền báo cáo tài khoản'
      });
    }

    const { reason } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    // Tìm user để báo cáo
    const User = require('../models/User');
    const user = await User.findById(comment.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Lưu log báo cáo vào database
    const SystemLog = require('../models/SystemLog');
    const reportLog = new SystemLog({
      type: 'user_report',
      adminId: req.user._id,
      adminName: req.user.fullName,
      targetUserId: user._id,
      targetUserName: user.fullName,
      targetUserEmail: user.email,
      message: `Admin ${req.user.fullName} đã báo cáo tài khoản ${user.fullName} (${user.email})`,
      details: {
        reason: reason || 'Vi phạm quy định bình luận',
        commentContent: comment.content,
        commentId: comment._id.toString(),
        additionalInfo: {
          commentRating: comment.rating,
          reportTime: new Date().toISOString()
        }
      },
      severity: 'high'
    });

    await reportLog.save();

    // Log console để debug
    console.log(`🚨 BÁO CÁO TÀI KHOẢN:`, {
      reportedBy: req.user.fullName,
      reportedUser: user.fullName,
      userEmail: user.email,
      reason: reason || 'Vi phạm quy định bình luận',
      commentContent: comment.content,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `Đã báo cáo tài khoản ${user.fullName} (${user.email})`,
      data: {
        userId: user._id,
        reportedUser: user.fullName,
        userEmail: user.email,
        reason: reason || 'Vi phạm quy định bình luận',
        isActive: user.isActive,
        logId: reportLog._id
      }
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi báo cáo tài khoản'
    });
  }
});

module.exports = router;
