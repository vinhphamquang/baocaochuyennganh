const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// Lấy tất cả bình luận (public)
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find({ isApproved: true })
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

// Admin: Duyệt/ẩn bình luận
router.patch('/:id/approve', auth.auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin mới có quyền duyệt bình luận'
      });
    }

    const { isApproved } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }

    res.json({
      success: true,
      message: isApproved ? 'Đã duyệt bình luận' : 'Đã ẩn bình luận',
      data: comment
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi duyệt bình luận'
    });
  }
});

module.exports = router;
