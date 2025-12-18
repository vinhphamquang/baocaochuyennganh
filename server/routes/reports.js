const express = require('express');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const CertificateTemplate = require('../models/CertificateTemplate');
const SystemLog = require('../models/SystemLog');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/reports/overview
 * Báo cáo tổng quan hệ thống
 */
router.get('/overview', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Tạo filter theo thời gian
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Thống kê người dùng
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersInPeriod = await User.countDocuments(dateFilter);
    
    // Thống kê chứng chỉ
    const totalCertificates = await Certificate.countDocuments();
    const certificatesInPeriod = await Certificate.countDocuments(dateFilter);
    const completedCertificates = await Certificate.countDocuments({
      ...dateFilter,
      processingStatus: 'completed'
    });
    const failedCertificates = await Certificate.countDocuments({
      ...dateFilter,
      processingStatus: 'failed'
    });
    
    // Tính tỷ lệ thành công
    const successRate = certificatesInPeriod > 0 
      ? Math.round((completedCertificates / certificatesInPeriod) * 100) 
      : 0;
    
    // Thống kê theo loại chứng chỉ
    const certificatesByType = await Certificate.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$certificateType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Thống kê theo ngày (7 ngày gần nhất)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const dailyStats = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const processed = await Certificate.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        
        const completed = await Certificate.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          processingStatus: 'completed'
        });
        
        return {
          date,
          processed,
          completed,
          successRate: processed > 0 ? Math.round((completed / processed) * 100) : 0
        };
      })
    );
    
    // Top users theo số chứng chỉ xử lý
    const topUsers = await Certificate.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          email: '$user.email',
          certificatesProcessed: '$count'
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsersInPeriod,
          totalCertificates,
          certificatesInPeriod,
          completedCertificates,
          failedCertificates,
          successRate
        },
        certificatesByType,
        dailyStats,
        topUsers
      }
    });
  } catch (error) {
    console.error('Get overview report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo báo cáo tổng quan'
    });
  }
});

/**
 * GET /api/reports/performance
 * Báo cáo hiệu suất hệ thống
 */
router.get('/performance', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Thống kê thời gian xử lý trung bình
    const processingTimeStats = await Certificate.aggregate([
      { $match: { ...dateFilter, processingTime: { $exists: true, $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: '$processingTime' },
          minProcessingTime: { $min: '$processingTime' },
          maxProcessingTime: { $max: '$processingTime' },
          totalProcessed: { $sum: 1 }
        }
      }
    ]);
    
    // Thống kê độ tin cậy trung bình
    const confidenceStats = await Certificate.aggregate([
      { $match: { ...dateFilter, confidence: { $exists: true, $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$confidence' },
          minConfidence: { $min: '$confidence' },
          maxConfidence: { $max: '$confidence' }
        }
      }
    ]);
    
    // Thống kê lỗi
    const errorStats = await Certificate.aggregate([
      { $match: { ...dateFilter, processingStatus: 'failed' } },
      { $group: { _id: '$errorMessage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Thống kê theo phương thức trích xuất
    const extractionMethodStats = await Certificate.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$extractionMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Thống kê template performance
    const templatePerformance = await CertificateTemplate.find()
      .select('name certificateType usage')
      .sort({ 'usage.averageConfidence': -1 });
    
    res.json({
      success: true,
      data: {
        processingTime: processingTimeStats[0] || {
          avgProcessingTime: 0,
          minProcessingTime: 0,
          maxProcessingTime: 0,
          totalProcessed: 0
        },
        confidence: confidenceStats[0] || {
          avgConfidence: 0,
          minConfidence: 0,
          maxConfidence: 0
        },
        errors: errorStats,
        extractionMethods: extractionMethodStats,
        templatePerformance
      }
    });
  } catch (error) {
    console.error('Get performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo báo cáo hiệu suất'
    });
  }
});

/**
 * GET /api/reports/certificates
 * Báo cáo chi tiết về chứng chỉ
 */
router.get('/certificates', adminAuth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      certificateType, 
      status, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    let filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (certificateType) filter.certificateType = certificateType;
    if (status) filter.processingStatus = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const certificates = await Certificate.find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('fileName certificateType processingStatus confidence processingTime extractionMethod createdAt extractedData');
    
    const total = await Certificate.countDocuments(filter);
    
    // Thống kê tóm tắt
    const summary = await Certificate.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCertificates: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          avgProcessingTime: { $avg: '$processingTime' },
          successCount: {
            $sum: { $cond: [{ $eq: ['$processingStatus', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        certificates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        summary: summary[0] || {
          totalCertificates: 0,
          avgConfidence: 0,
          avgProcessingTime: 0,
          successCount: 0
        }
      }
    });
  } catch (error) {
    console.error('Get certificates report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo báo cáo chứng chỉ'
    });
  }
});

/**
 * GET /api/reports/users
 * Báo cáo về người dùng
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, active } = req.query;
    
    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (active !== undefined) filter.isActive = active === 'true';
    
    // Thống kê người dùng với số chứng chỉ đã xử lý
    const usersWithStats = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'certificates',
          localField: '_id',
          foreignField: 'userId',
          as: 'certificates'
        }
      },
      {
        $addFields: {
          totalCertificates: { $size: '$certificates' },
          completedCertificates: {
            $size: {
              $filter: {
                input: '$certificates',
                cond: { $eq: ['$$this.processingStatus', 'completed'] }
              }
            }
          },
          lastActivity: { $max: '$certificates.createdAt' }
        }
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          totalCertificates: 1,
          completedCertificates: 1,
          lastActivity: 1
        }
      },
      { $sort: { totalCertificates: -1 } }
    ]);
    
    // Thống kê đăng ký theo tháng
    const registrationsByMonth = await User.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        users: usersWithStats,
        registrationsByMonth
      }
    });
  } catch (error) {
    console.error('Get users report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo báo cáo người dùng'
    });
  }
});

/**
 * GET /api/reports/system-logs
 * Báo cáo nhật ký hệ thống
 */
router.get('/system-logs', adminAuth, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      severity, 
      page = 1, 
      limit = 100 
    } = req.query;
    
    let filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await SystemLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await SystemLog.countDocuments(filter);
    
    // Thống kê theo loại log
    const logsByType = await SystemLog.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Thống kê theo mức độ nghiêm trọng
    const logsBySeverity = await SystemLog.aggregate([
      { $match: filter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        statistics: {
          logsByType,
          logsBySeverity
        }
      }
    });
  } catch (error) {
    console.error('Get system logs report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo báo cáo nhật ký hệ thống'
    });
  }
});

/**
 * GET /api/reports/export/:type
 * Xuất báo cáo ra file
 */
router.get('/export/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json', startDate, endDate } = req.query;
    
    let data;
    let filename;
    
    switch (type) {
      case 'overview':
        // Gọi lại endpoint overview để lấy data
        data = await getOverviewData(startDate, endDate);
        filename = `overview_report_${Date.now()}`;
        break;
        
      case 'certificates':
        data = await getCertificatesData(startDate, endDate);
        filename = `certificates_report_${Date.now()}`;
        break;
        
      case 'users':
        data = await getUsersData(startDate, endDate);
        filename = `users_report_${Date.now()}`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Loại báo cáo không hợp lệ'
        });
    }
    
    if (format === 'csv') {
      // Chuyển đổi sang CSV (cần thêm thư viện csv-writer)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      // Implement CSV conversion here
      res.send('CSV export not implemented yet');
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(data);
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất báo cáo'
    });
  }
});

// Helper functions để lấy data cho export
async function getOverviewData(startDate, endDate) {
  // Implementation tương tự như endpoint /overview
  // Trả về data để export
  return { message: 'Overview data for export' };
}

async function getCertificatesData(startDate, endDate) {
  // Implementation để lấy data chứng chỉ
  return { message: 'Certificates data for export' };
}

async function getUsersData(startDate, endDate) {
  // Implementation để lấy data người dùng
  return { message: 'Users data for export' };
}

module.exports = router;