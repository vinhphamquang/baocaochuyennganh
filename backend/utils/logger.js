const SystemLog = require('../models/SystemLog')

/**
 * Utility để ghi log các hoạt động hệ thống
 */
class SystemLogger {
  
  /**
   * Ghi log đăng ký tài khoản
   */
  static async logUserRegister(user, additionalInfo = {}) {
    try {
      const log = new SystemLog({
        type: 'user_register',
        targetUserId: user._id,
        targetUserName: user.fullName,
        targetUserEmail: user.email,
        message: `Tài khoản mới đăng ký: ${user.fullName} (${user.email})`,
        details: {
          reason: 'Đăng ký tài khoản mới',
          additionalInfo: {
            userRole: user.role,
            registrationTime: new Date().toISOString(),
            ...additionalInfo
          }
        },
        severity: 'low'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging user register:', error)
    }
  }

  /**
   * Ghi log đăng nhập
   */
  static async logUserLogin(user, additionalInfo = {}) {
    try {
      const log = new SystemLog({
        type: 'user_login',
        targetUserId: user._id,
        targetUserName: user.fullName,
        targetUserEmail: user.email,
        message: `${user.fullName} đã đăng nhập`,
        details: {
          reason: 'Đăng nhập hệ thống',
          additionalInfo: {
            userRole: user.role,
            loginTime: new Date().toISOString(),
            ...additionalInfo
          }
        },
        severity: 'low'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging user login:', error)
    }
  }

  /**
   * Ghi log cập nhật profile
   */
  static async logProfileUpdate(user, changes, additionalInfo = {}) {
    try {
      const log = new SystemLog({
        type: 'user_profile_update',
        targetUserId: user._id,
        targetUserName: user.fullName,
        targetUserEmail: user.email,
        message: `${user.fullName} đã cập nhật thông tin cá nhân`,
        details: {
          reason: 'Cập nhật thông tin cá nhân',
          additionalInfo: {
            changes,
            updateTime: new Date().toISOString(),
            ...additionalInfo
          }
        },
        severity: 'low'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging profile update:', error)
    }
  }

  /**
   * Ghi log upload chứng chỉ
   */
  static async logCertificateUpload(user, certificate, additionalInfo = {}) {
    try {
      const log = new SystemLog({
        type: 'certificate_upload',
        targetUserId: user._id,
        targetUserName: user.fullName,
        targetUserEmail: user.email,
        message: `${user.fullName} đã tải lên chứng chỉ: ${certificate.fileName}`,
        details: {
          reason: 'Tải lên chứng chỉ mới',
          additionalInfo: {
            certificateId: certificate._id,
            fileName: certificate.fileName,
            fileSize: certificate.fileSize,
            certificateType: certificate.certificateType,
            uploadTime: new Date().toISOString(),
            ...additionalInfo
          }
        },
        severity: 'low'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging certificate upload:', error)
    }
  }

  /**
   * Ghi log xử lý chứng chỉ
   */
  static async logCertificateProcess(user, certificate, status, additionalInfo = {}) {
    try {
      const log = new SystemLog({
        type: 'certificate_process',
        targetUserId: user._id,
        targetUserName: user.fullName,
        targetUserEmail: user.email,
        message: `Xử lý chứng chỉ ${certificate.fileName}: ${status}`,
        details: {
          reason: `Xử lý chứng chỉ - ${status}`,
          additionalInfo: {
            certificateId: certificate._id,
            fileName: certificate.fileName,
            processingStatus: status,
            processTime: new Date().toISOString(),
            ...additionalInfo
          }
        },
        severity: status === 'failed' ? 'medium' : 'low'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging certificate process:', error)
    }
  }

  /**
   * Ghi log tạo bình luận
   */
  static async logCommentCreate(user, comment, additionalInfo = {}) {
    try {
      const log = new SystemLog({
        type: 'comment_create',
        targetUserId: user._id,
        targetUserName: user.fullName,
        targetUserEmail: user.email,
        message: `${user.fullName} đã tạo bình luận mới`,
        details: {
          reason: 'Tạo bình luận mới',
          commentContent: comment.content,
          commentId: comment._id.toString(),
          additionalInfo: {
            rating: comment.rating,
            createTime: new Date().toISOString(),
            ...additionalInfo
          }
        },
        severity: 'low'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging comment create:', error)
    }
  }

  /**
   * Ghi log hành động admin
   */
  static async logAdminAction(admin, action, targetUser, details = {}) {
    try {
      const log = new SystemLog({
        type: 'admin_action',
        adminId: admin._id,
        adminName: admin.fullName,
        targetUserId: targetUser?._id,
        targetUserName: targetUser?.fullName,
        targetUserEmail: targetUser?.email,
        message: `Admin ${admin.fullName} đã thực hiện: ${action}`,
        details: {
          reason: action,
          ...details
        },
        severity: 'medium'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  /**
   * Ghi log lỗi hệ thống
   */
  static async logSystemError(error, context = {}) {
    try {
      const log = new SystemLog({
        type: 'system_error',
        message: `Lỗi hệ thống: ${error.message}`,
        details: {
          reason: 'Lỗi hệ thống',
          additionalInfo: {
            errorStack: error.stack,
            errorTime: new Date().toISOString(),
            context
          }
        },
        severity: 'high'
      })
      
      await log.save()
      return log
    } catch (logError) {
      console.error('Error logging system error:', logError)
    }
  }

  /**
   * Ghi log cảnh báo bảo mật
   */
  static async logSecurityAlert(message, details = {}) {
    try {
      const log = new SystemLog({
        type: 'security_alert',
        message: `Cảnh báo bảo mật: ${message}`,
        details: {
          reason: 'Cảnh báo bảo mật',
          additionalInfo: {
            alertTime: new Date().toISOString(),
            ...details
          }
        },
        severity: 'critical'
      })
      
      await log.save()
      return log
    } catch (error) {
      console.error('Error logging security alert:', error)
    }
  }
}

module.exports = SystemLogger