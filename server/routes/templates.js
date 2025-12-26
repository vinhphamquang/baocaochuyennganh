const express = require('express');
const multer = require('multer');
const CertificateTemplate = require('../models/CertificateTemplate');
const { adminAuth } = require('../middleware/auth');
const SystemLogger = require('../utils/logger');

const router = express.Router();

// Configure multer for template images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * GET /api/templates
 * Lấy danh sách tất cả templates
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const { type, active, search } = req.query;
    
    let query = {};
    
    if (type) query.certificateType = type;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) {
      query.$text = { $search: search };
    }
    
    const templates = await CertificateTemplate.find(query)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email')
      .sort({ updatedAt: -1 });
    
    // Tính thống kê tổng quan
    const totalTemplates = await CertificateTemplate.countDocuments(query);
    const activeTemplates = await CertificateTemplate.countDocuments({ ...query, isActive: true });
    
    const usageStats = await CertificateTemplate.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: '$usage.totalProcessed' },
          totalSuccessful: { $sum: '$usage.successfulExtractions' },
          avgConfidence: { $avg: '$usage.averageConfidence' }
        }
      }
    ]);
    
    const stats = usageStats[0] || {
      totalProcessed: 0,
      totalSuccessful: 0,
      avgConfidence: 0
    };
    
    res.json({
      success: true,
      data: templates,
      total: templates.length,
      stats: {
        totalTemplates,
        activeTemplates,
        totalProcessed: stats.totalProcessed,
        averageConfidence: Math.round(stats.avgConfidence || 0),
        successRate: stats.totalProcessed > 0 
          ? Math.round((stats.totalSuccessful / stats.totalProcessed) * 100)
          : 0
      }
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
 * GET /api/templates/:id
 * Lấy chi tiết một template
 */
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('updatedBy', 'fullName email');
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin template'
    });
  }
});

/**
 * POST /api/templates
 * Tạo template mới
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.userId,
      updatedBy: req.userId
    };
    
    const template = new CertificateTemplate(templateData);
    await template.save();
    
    // Log tạo template
    await SystemLogger.logAdminAction(
      req.user,
      'Template Creation',
      null,
      {
        reason: 'Tạo template chứng chỉ mới',
        additionalInfo: {
          templateName: template.name,
          certificateType: template.certificateType,
          templateId: template._id
        }
      }
    );
    
    res.status(201).json({
      success: true,
      message: 'Tạo template thành công',
      data: template
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
 * Cập nhật template
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }
    
    const oldData = template.toObject();
    
    // Cập nhật template
    Object.assign(template, req.body);
    template.updatedBy = req.userId;
    template.version = incrementVersion(template.version);
    
    await template.save();
    
    // Log cập nhật template
    await SystemLogger.logAdminAction(
      req.user,
      'Template Update',
      null,
      {
        reason: 'Cập nhật template chứng chỉ',
        additionalInfo: {
          templateName: template.name,
          templateId: template._id,
          changes: getChanges(oldData, template.toObject())
        }
      }
    );
    
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

/**
 * DELETE /api/templates/:id
 * Xóa template
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }
    
    await CertificateTemplate.findByIdAndDelete(req.params.id);
    
    // Log xóa template
    await SystemLogger.logAdminAction(
      req.user,
      'Template Deletion',
      null,
      {
        reason: 'Xóa template chứng chỉ',
        additionalInfo: {
          templateName: template.name,
          certificateType: template.certificateType,
          templateId: template._id,
          usage: template.usage
        }
      }
    );
    
    res.json({
      success: true,
      message: 'Xóa template thành công'
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
 * POST /api/templates/:id/sample-images
 * Upload ảnh mẫu cho template
 */
router.post('/:id/sample-images', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file ảnh nào được upload'
      });
    }
    
    // Trong thực tế, bạn sẽ upload lên cloud storage (AWS S3, Cloudinary, etc.)
    // Ở đây chỉ mô phỏng
    const sampleImages = req.files.map((file, index) => ({
      filename: file.originalname,
      url: `/uploads/templates/${template._id}/${Date.now()}_${index}_${file.originalname}`,
      description: req.body.descriptions ? req.body.descriptions[index] : '',
      uploadedAt: new Date()
    }));
    
    template.sampleImages.push(...sampleImages);
    template.updatedBy = req.userId;
    await template.save();
    
    res.json({
      success: true,
      message: 'Upload ảnh mẫu thành công',
      data: sampleImages
    });
  } catch (error) {
    console.error('Upload sample images error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload ảnh mẫu'
    });
  }
});

/**
 * GET /api/templates/stats/overview
 * Thống kê tổng quan templates
 */
router.get('/stats/overview', adminAuth, async (req, res) => {
  try {
    const totalTemplates = await CertificateTemplate.countDocuments();
    const activeTemplates = await CertificateTemplate.countDocuments({ isActive: true });
    
    // Tính tổng số chứng chỉ đã xử lý và độ chính xác trung bình
    const usageStats = await CertificateTemplate.aggregate([
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: '$usage.totalProcessed' },
          totalSuccessful: { $sum: '$usage.successfulExtractions' },
          avgConfidence: { $avg: '$usage.averageConfidence' }
        }
      }
    ]);
    
    const stats = usageStats[0] || {
      totalProcessed: 0,
      totalSuccessful: 0,
      avgConfidence: 0
    };
    
    // Tính tỷ lệ thành công
    const successRate = stats.totalProcessed > 0 
      ? Math.round((stats.totalSuccessful / stats.totalProcessed) * 100)
      : 0;
    
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
    
    // Chi tiết hiệu suất từng template
    const templatePerformance = await CertificateTemplate.find({ isActive: true })
      .select('name certificateType usage')
      .sort({ 'usage.totalProcessed': -1 });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalTemplates,
          activeTemplates,
          inactiveTemplates: totalTemplates - activeTemplates,
          totalProcessed: stats.totalProcessed,
          totalSuccessful: stats.totalSuccessful,
          successRate,
          averageConfidence: Math.round(stats.avgConfidence || 0)
        },
        templatesByType,
        mostUsedTemplates,
        mostAccurateTemplates,
        templatePerformance: templatePerformance.map(t => ({
          name: t.name,
          certificateType: t.certificateType,
          processed: t.usage.totalProcessed,
          successful: t.usage.successfulExtractions,
          confidence: Math.round(t.usage.averageConfidence || 0),
          successRate: t.usage.totalProcessed > 0 
            ? Math.round((t.usage.successfulExtractions / t.usage.totalProcessed) * 100)
            : 0
        }))
      }
    });
  } catch (error) {
    console.error('Get template stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê template'
    });
  }
});

/**
 * POST /api/templates/:id/test
 * Test template với ảnh mẫu
 */
router.post('/:id/test', adminAuth, upload.single('testImage'), async (req, res) => {
  try {
    const template = await CertificateTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload ảnh test'
      });
    }
    
    // Ở đây bạn sẽ tích hợp với OCR engine để test template
    // Tạm thời trả về kết quả mô phỏng
    const testResult = {
      templateId: template._id,
      templateName: template.name,
      testImage: req.file.originalname,
      extractedData: {
        fullName: 'NGUYEN VAN A',
        certificateNumber: 'IELTS123456',
        examDate: '15/10/2023',
        scores: {
          listening: 8.0,
          reading: 7.5,
          writing: 7.0,
          speaking: 8.5,
          overall: 7.5
        }
      },
      confidence: 85,
      processingTime: 2.3,
      matchedPatterns: [
        'namePatterns[0]: Family Name + First Name pattern',
        'scorePatterns[1]: IELTS band score pattern'
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

// Helper functions
function incrementVersion(currentVersion) {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[parts.length - 1]) + 1;
  parts[parts.length - 1] = patch.toString();
  return parts.join('.');
}

function getChanges(oldData, newData) {
  const changes = {};
  const fieldsToCheck = ['name', 'description', 'patterns', 'scoreConfig', 'isActive'];
  
  fieldsToCheck.forEach(field => {
    if (JSON.stringify(oldData[field]) !== JSON.stringify(newData[field])) {
      changes[field] = {
        old: oldData[field],
        new: newData[field]
      };
    }
  });
  
  return changes;
}

module.exports = router;