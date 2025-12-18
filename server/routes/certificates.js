const express = require('express')
const multer = require('multer')
const Certificate = require('../models/Certificate')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const SystemLogger = require('../utils/logger')

const router = express.Router()

// Configure multer for file upload
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ hỗ trợ file JPG, PNG, PDF'), false)
    }
  }
})

// Upload and process certificate
router.post('/upload', auth, upload.single('certificate'), async (req, res) => {
  try {
    console.log('📤 Certificate upload request received')
    console.log('   User ID:', req.userId)
    console.log('   File:', req.file ? req.file.originalname : 'No file')
    
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file để tải lên' })
    }

    // Nhận dữ liệu đã trích xuất từ client (Tesseract.js OCR)
    let extractedData = {}
    if (req.body.extractedData) {
      try {
        extractedData = JSON.parse(req.body.extractedData)
      } catch (e) {
        console.error('Error parsing extracted data:', e)
      }
    }

    // Xác định loại chứng chỉ
    let certificateType = extractedData.certificateType || 'OTHER'
    
    // Chuyển đổi các giá trị không hợp lệ
    const validTypes = ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'HSK', 'JLPT', 'OTHER']
    if (!validTypes.includes(certificateType)) {
      certificateType = 'OTHER'
    }

    // Chuẩn hóa dữ liệu
    const normalizedData = {
      fullName: extractedData.fullName || '',
      dateOfBirth: extractedData.dateOfBirth || '',
      certificateNumber: extractedData.certificateNumber || '',
      testDate: extractedData.examDate || '',
      issueDate: extractedData.issueDate || '',
      issuingOrganization: getIssuingOrg(certificateType),
      scores: extractedData.scores || {},
      rawText: extractedData.rawText || ''
    }

    // Tính độ tin cậy dựa trên số trường đã điền
    const filledFields = Object.values(normalizedData).filter(v => 
      v && (typeof v === 'string' ? v.trim() : Object.keys(v).length > 0)
    ).length
    const totalFields = 7
    const confidence = Math.round((filledFields / totalFields) * 100)

    // Tạo bản ghi chứng chỉ
    const certificate = new Certificate({
      userId: req.userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      certificateType: certificateType,
      extractedData: normalizedData,
      processingStatus: 'completed',
      ocrConfidence: confidence,
      processingTime: 0 // OCR đã xử lý trên client
    })

    await certificate.save()
    console.log('✅ Certificate saved successfully:', certificate._id)

    // Cập nhật số lượng chứng chỉ của user
    await User.findByIdAndUpdate(req.userId, {
      $inc: { certificatesProcessed: 1 }
    })
    console.log('✅ User certificates count updated')

    // Log upload certificate
    const user = await User.findById(req.userId)
    await SystemLogger.logCertificateUpload(user, certificate, {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      ocrConfidence: confidence
    })

    // Log xử lý certificate
    await SystemLogger.logCertificateProcess(user, certificate, 'completed', {
      processingTime: 0,
      confidence: confidence,
      extractedFields: filledFields
    })

    res.json({
      message: 'Tải lên và xử lý thành công',
      certificateId: certificate._id,
      certificate
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Lỗi khi tải lên file' })
  }
})

// Helper function để xác định tổ chức cấp chứng chỉ
function getIssuingOrg(certificateType) {
  const orgMap = {
    'IELTS': 'British Council / IDP',
    'TOEIC': 'ETS',
    'TOEFL': 'ETS',
    'VSTEP': 'Bộ Giáo dục và Đào tạo'
  }
  return orgMap[certificateType] || 'Unknown'
}

// Get user's certificates
router.get('/', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('-__v')

    res.json({ certificates })
  } catch (error) {
    console.error('Get certificates error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách chứng chỉ' })
  }
})

// Get certificate by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      _id: req.params.id,
      userId: req.userId
    })

    if (!certificate) {
      return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' })
    }

    res.json({ certificate })
  } catch (error) {
    console.error('Get certificate error:', error)
    res.status(500).json({ message: 'Lỗi khi lấy thông tin chứng chỉ' })
  }
})

// Update certificate data
router.put('/:id', auth, async (req, res) => {
  try {
    const { extractedData } = req.body

    const certificate = await Certificate.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { extractedData },
      { new: true }
    )

    if (!certificate) {
      return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' })
    }

    res.json({ 
      message: 'Cập nhật thành công',
      certificate 
    })
  } catch (error) {
    console.error('Update certificate error:', error)
    res.status(500).json({ message: 'Lỗi khi cập nhật chứng chỉ' })
  }
})

// Delete certificate
router.delete('/:id', auth, async (req, res) => {
  try {
    const certificate = await Certificate.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    })

    if (!certificate) {
      return res.status(404).json({ message: 'Không tìm thấy chứng chỉ' })
    }

    res.json({ message: 'Xóa chứng chỉ thành công' })
  } catch (error) {
    console.error('Delete certificate error:', error)
    res.status(500).json({ message: 'Lỗi khi xóa chứng chỉ' })
  }
})

module.exports = router