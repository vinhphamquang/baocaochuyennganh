const express = require('express');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/reports/overview
 * Báo cáo tổng quan hệ thống với dữ liệu thực
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
    
    // Thống kê người dùng thực tế
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersInPeriod = await User.countDocuments(dateFilter);
    
    // Thống kê chứng chỉ thực tế
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
    
    // Thống kê theo loại chứng chỉ thực tế
    const certificatesByType = await Certificate.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$certificateType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Thống kê theo ngày (7 ngày gần nhất) với dữ liệu thực
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
    
    // Top users theo số chứng chỉ xử lý thực tế
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
    
    const reportData = {
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
    };

    res.json({
      success: true,
      data: reportData
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
 * Báo cáo hiệu suất hệ thống với dữ liệu thực
 */
router.get('/performance', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate, certificateType } = req.query;
    
    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (certificateType) {
      filter.certificateType = certificateType;
    }
    
    // Thống kê thời gian xử lý thực tế
    const processingTimeStats = await Certificate.aggregate([
      { $match: { ...filter, processingTime: { $exists: true, $gt: 0 } } },
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
    
    // Thống kê độ tin cậy thực tế
    const confidenceStats = await Certificate.aggregate([
      { $match: { ...filter, confidence: { $exists: true, $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: '$confidence' },
          minConfidence: { $min: '$confidence' },
          maxConfidence: { $max: '$confidence' }
        }
      }
    ]);
    
    // Thống kê lỗi thực tế
    const errorStats = await Certificate.aggregate([
      { $match: { ...filter, processingStatus: 'failed' } },
      { $group: { _id: '$errorMessage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Thống kê theo phương thức trích xuất thực tế
    const extractionMethodStats = await Certificate.aggregate([
      { $match: filter },
      { $group: { _id: '$extractionMethod', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const performanceData = {
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
      extractionMethods: extractionMethodStats
    };

    res.json({
      success: true,
      data: performanceData,
      filters: { startDate, endDate, certificateType }
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
 * Báo cáo chi tiết chứng chỉ với dữ liệu thực
 */
router.get('/certificates', adminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      certificateType, 
      status, 
      startDate, 
      endDate 
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
    
    // Lấy certificates thực tế từ database
    const certificates = await Certificate.find(filter)
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('fileName certificateType processingStatus confidence processingTime extractionMethod createdAt extractedData');
    
    const total = await Certificate.countDocuments(filter);
    
    // Thống kê tóm tắt thực tế
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
      },
      filters: { certificateType, status, startDate, endDate }
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
 * Báo cáo người dùng với dữ liệu thực
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { active, startDate, endDate, sortBy = 'totalCertificates' } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (active !== undefined) filter.isActive = active === 'true';
    
    // Thống kê người dùng với số chứng chỉ đã xử lý thực tế
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
      }
    ]);

    // Sort users theo yêu cầu
    const sortField = sortBy === 'totalCertificates' ? { totalCertificates: -1 } :
                     sortBy === 'lastActivity' ? { lastActivity: -1 } :
                     sortBy === 'createdAt' ? { createdAt: -1 } : { totalCertificates: -1 };
    
    usersWithStats.sort((a, b) => {
      if (sortBy === 'totalCertificates') return b.totalCertificates - a.totalCertificates;
      if (sortBy === 'lastActivity') return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
      if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
    
    // Thống kê đăng ký theo tháng thực tế
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
      },
      filters: { active, startDate, endDate, sortBy }
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
 * POST /api/reports/export
 * Xuất báo cáo
 */
router.post('/export', adminAuth, async (req, res) => {
  try {
    const { reportType, format = 'json', filters = {} } = req.body;

    // Mock export data
    const exportData = {
      reportType,
      generatedAt: new Date().toISOString(),
      filters,
      data: {
        summary: 'This is a mock export',
        totalRecords: 150,
        exportedBy: 'Admin'
      }
    };

    const filename = `${reportType}_report_${Date.now()}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send('Name,Type,Status,Date\nSample,IELTS,Completed,2024-12-17');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(exportData);
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xuất báo cáo'
    });
  }
});

/**
 * GET /api/reports/realtime
 * Dữ liệu thời gian thực từ database
 */
router.get('/realtime', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Thống kê hôm nay
    const todayProcessed = await Certificate.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayCompleted = await Certificate.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      processingStatus: 'completed'
    });

    const todayFailed = await Certificate.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      processingStatus: 'failed'
    });

    // Đang xử lý
    const currentProcessing = await Certificate.countDocuments({
      processingStatus: 'processing'
    });

    // Thời gian xử lý trung bình hôm nay
    const avgProcessingTimeResult = await Certificate.aggregate([
      { 
        $match: { 
          createdAt: { $gte: today, $lt: tomorrow },
          processingTime: { $exists: true, $gt: 0 }
        }
      },
      { $group: { _id: null, avgTime: { $avg: '$processingTime' } } }
    ]);

    // Users hoạt động (đăng nhập trong 24h qua)
    const activeUsers = await User.countDocuments({
      isActive: true,
      // Có thể thêm field lastLoginAt để track chính xác hơn
    });

    const realtimeData = {
      currentProcessing,
      queueLength: currentProcessing, // Giả sử queue = đang xử lý
      systemLoad: (Math.random() * 30 + 40).toFixed(1), // Mock system load
      activeUsers,
      todayStats: {
        processed: todayProcessed,
        completed: todayCompleted,
        failed: todayFailed,
        avgProcessingTime: avgProcessingTimeResult[0]?.avgTime?.toFixed(2) || '0.00'
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    console.error('Get realtime data error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu thời gian thực'
    });
  }
});

module.exports = router;