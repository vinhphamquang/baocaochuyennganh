// Load environment variables first
require('dotenv').config({ path: '.env' })

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const certificateRoutes = require('./routes/certificates')
const adminRoutes = require('./routes/admin')
const commentRoutes = require('./routes/comments')
const aiOcrRoutes = require('./routes/ai-ocr')
const templateRoutes = require('./routes/templates-simple')
const reportRoutes = require('./routes/reports-simple')
const errorLogger = require('./middleware/errorLogger')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting - Tăng giới hạn cho development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (tăng từ 100)
})
app.use(limiter)

// Auth-specific rate limiting (higher limit for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 auth attempts per 15 minutes per IP
  message: { error: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-extraction', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    })
    
    console.log(`MongoDB Atlas kết nối thành công: ${conn.connection.host}`)
  } catch (error) {
    console.error('Lỗi kết nối MongoDB Atlas:', error.message)
    
    // Retry connection after 5 seconds
    console.log('Thử kết nối lại sau 5 giây...')
    setTimeout(connectDB, 5000)
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose kết nối tới MongoDB Atlas')
})

mongoose.connection.on('error', (err) => {
  console.error('Lỗi kết nối Mongoose:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose ngắt kết nối khỏi MongoDB Atlas')
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('Đã đóng kết nối MongoDB Atlas')
  process.exit(0)
})

// Initialize connection
connectDB()

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/ai-ocr', aiOcrRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/reports', reportRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error logging middleware
app.use(errorLogger)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  
  // Handle rate limit errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Quá nhiều requests. Vui lòng thử lại sau.',
      retryAfter: err.retryAfter
    })
  }
  
  res.status(500).json({ 
    message: 'Có lỗi xảy ra trên server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint không tồn tại' })
})

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})