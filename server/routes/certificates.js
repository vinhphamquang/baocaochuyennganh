const express = require('express')
const multer = require('multer')
const Certificate = require('../models/Certificate')
const User = require('../models/User')
const { auth } = require('../middleware/auth')

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
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file để tải lên' })
    }

    // Create certificate record
    const certificate = new Certificate({
      userId: req.userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      processingStatus: 'processing'
    })

    await certificate.save()

    // Simulate OCR processing
    setTimeout(async () => {
      try {
        // Mock extracted data
        const mockData = {
          fullName: 'Nguyễn Văn A',
          dateOfBirth: '15/03/1995',
          certificateNumber: 'IELTS-2023-ABC123',
          testDate: '12/10/2023',
          issueDate: '25/10/2023',
          issuingOrganization: 'British Council',
          scores: {
            overall: '7.5',
            listening: '8.0',
            reading: '7.0',
            writing: '7.0',
            speaking: '8.0'
          }
        }

        // Update certificate with extracted data
        certificate.extractedData = mockData
        certificate.processingStatus = 'completed'
        certificate.ocrConfidence = 95
        certificate.processingTime = 2500
        certificate.certificateType = 'IELTS'

        await certificate.save()

        // Update user's certificate count
        await User.findByIdAndUpdate(req.userId, {
          $inc: { certificatesProcessed: 1 }
        })
      } catch (error) {
        console.error('Processing error:', error)
        certificate.processingStatus = 'failed'
        certificate.errorMessage = 'Lỗi khi xử lý file'
        await certificate.save()
      }
    }, 3000)

    res.json({
      message: 'File đã được tải lên và đang xử lý',
      certificateId: certificate._id
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Lỗi khi tải lên file' })
  }
})

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