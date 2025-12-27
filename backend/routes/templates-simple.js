const express = require('express');
const CertificateTemplate = require('../models/CertificateTemplate');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/templates
 * Lấy danh sách tất cả templates từ database
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { type, active, search } = req.query;
    
    let query = {};
    
    if (type) query.certificateType = type;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const templates = await CertificateTemplate.find(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: templates,
      total: templates.length
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách template'
    });
  }
});

/**
 * POST /api/templates
 * Tạo template mới trong database
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, certificateType, description } = req.body;
    
    // Validate input
    if (!name || !certificateType) {
      return res.status(400).json({
        success: false,
        message: 'Tên và loại chứng chỉ là bắt buộc'
      });
    }

    // Kiểm tra template đã tồn tại chưa
    const existingTemplate = await CertificateTemplate.findOne({ 
      name: name.trim(),
      certificateType 
    });
    
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Template với tên này đã tồn tại'
      });
    }

    // Tạo template mới
    const templateData = {
      name: name.trim(),
      certificateType,
      description: description || '',
      patterns: {
        namePatterns: [],
        dobPatterns: [],
        certificateNumberPatterns: [],
        examDatePatterns: [],
        scorePatterns: []
      },
      scoreConfig: {
        skills: certificateType === 'IELTS' ? ['listening', 'reading', 'writing', 'speaking'] :
               certificateType === 'TOEIC' ? ['listening', 'reading'] :
               certificateType === 'VSTEP' ? ['listening', 'reading', 'writing', 'speaking'] :
               ['listening', 'reading', 'writing', 'speaking'],
        hasOverall: certificateType !== 'TOEIC',
        hasTotal: certificateType === 'TOEIC',
        minScore: 0,
        maxScore: certificateType === 'IELTS' ? 9 :
                 certificateType === 'TOEIC' ? 990 :
                 certificateType === 'VSTEP' ? 10 : 9,
        scoreType: certificateType === 'TOEIC' ? 'integer' : 'decimal'
      },
      usage: {
        totalProcessed: 0,
        successfulExtractions: 0,
        averageConfidence: 0
      },
      isActive: true,
      version: '1.0',
      createdBy: req.userId,
      updatedBy: req.userId
    };

    const newTemplate = new CertificateTemplate(templateData);
    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: 'Tạo template thành công',
      data: newTemplate
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo template'
    });
  }
});

/**
 * PUT /api/templates/:id
 * Cập nhật template trong database
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, certificateType, description, isActive } = req.body;

    const template = await CertificateTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    // Kiểm tra tên trùng lặp (nếu thay đổi tên)
    if (name && name !== template.name) {
      const existingTemplate = await CertificateTemplate.findOne({ 
        name: name.trim(),
        certificateType: certificateType || template.certificateType,
        _id: { $ne: id }
      });
      
      if (existingTemplate) {
        return res.status(400).json({
          success: false,
          message: 'Template với tên này đã tồn tại'
        });
      }
    }
    
    // Cập nhật template
    if (name) template.name = name.trim();
    if (certificateType) template.certificateType = certificateType;
    if (description !== undefined) template.description = description;
    if (isActive !== undefined) template.isActive = isActive;
    
    template.updatedBy = req.userId;
    template.version = incrementVersion(template.version);
    
    await template.save();

    res.json({
      success: true,
      message: 'Cập nhật template thành công',
      data: template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật template'
    });
  }
});

// Helper function để tăng version
function incrementVersion(currentVersion) {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[parts.length - 1]) + 1;
  parts[parts.length - 1] = patch.toString();
  return parts.join('.');
}

/**
 * DELETE /api/templates/:id
 * Xóa template khỏi database
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await CertificateTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    await CertificateTemplate.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Đã xóa template "${template.name}" thành công`
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa template'
    });
  }
});

/**
 * POST /api/templates/:id/toggle
 * Bật/tắt template trong database
 */
router.post('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const template = await CertificateTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    template.isActive = !template.isActive;
    template.updatedBy = req.userId;
    await template.save();

    res.json({
      success: true,
      message: `Template đã được ${template.isActive ? 'kích hoạt' : 'tạm dừng'}`,
      data: { id, isActive: template.isActive }
    });
  } catch (error) {
    console.error('Toggle template error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái template'
    });
  }
});

/**
 * POST /api/templates/:id/test
 * Test template với ảnh mẫu
 */
router.post('/:id/test', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock test result
    const testResult = {
      templateId: id,
      testSuccess: true,
      confidence: Math.floor(Math.random() * 30) + 70,
      processingTime: (Math.random() * 3 + 1).toFixed(2),
      extractedData: {
        fullName: 'NGUYEN VAN TEST',
        certificateNumber: 'TEST' + Math.floor(Math.random() * 100000),
        examDate: '15/12/2024',
        scores: {
          listening: (Math.random() * 3 + 6).toFixed(1),
          reading: (Math.random() * 3 + 6).toFixed(1),
          writing: (Math.random() * 3 + 6).toFixed(1),
          speaking: (Math.random() * 3 + 6).toFixed(1),
          overall: (Math.random() * 3 + 6).toFixed(1)
        }
      },
      matchedPatterns: [
        'Name pattern matched successfully',
        'Certificate number pattern matched',
        'Score patterns matched with high confidence'
      ]
    };

    res.json({
      success: true,
      message: 'Test template thành công',
      data: testResult
    });
  } catch (error) {
    console.error('Test template error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi test template'
    });
  }
});

/**
 * GET /api/templates/stats/overview
 * Thống kê tổng quan templates từ database
 */
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalTemplates = await CertificateTemplate.countDocuments();
    const activeTemplates = await CertificateTemplate.countDocuments({ isActive: true });
    
    // Thống kê theo loại chứng chỉ
    const templatesByType = await CertificateTemplate.aggregate([
      { $group: { _id: '$certificateType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Template được sử dụng nhiều nhất
    const mostUsedTemplates = await CertificateTemplate.find()
      .sort({ 'usage.totalProcessed': -1 })
      .limit(5)
      .select('name certificateType usage');
    
    // Template có độ chính xác cao nhất
    const mostAccurateTemplates = await CertificateTemplate.find()
      .sort({ 'usage.averageConfidence': -1 })
      .limit(5)
      .select('name certificateType usage');

    const stats = {
      overview: {
        totalTemplates,
        activeTemplates,
        inactiveTemplates: totalTemplates - activeTemplates
      },
      templatesByType,
      mostUsedTemplates,
      mostAccurateTemplates
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê template'
    });
  }
});

module.exports = router;