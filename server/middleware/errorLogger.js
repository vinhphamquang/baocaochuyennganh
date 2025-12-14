const SystemLogger = require('../utils/logger')

/**
 * Middleware để log lỗi hệ thống
 */
const errorLogger = (err, req, res, next) => {
  // Log lỗi vào console
  console.error('Error occurred:', err)

  // Log lỗi vào database
  SystemLogger.logSystemError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId || null,
    body: req.body,
    params: req.params,
    query: req.query
  }).catch(logErr => {
    console.error('Failed to log error to database:', logErr)
  })

  // Tiếp tục xử lý lỗi
  next(err)
}

module.exports = errorLogger