const mongoose = require('mongoose')

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  certificateType: {
    type: String,
    enum: ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'HSK', 'JLPT', 'OTHER', 'Unknown'],
    default: 'OTHER'
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  extractedData: {
    fullName: String,
    dateOfBirth: String,
    certificateNumber: String,
    testDate: String,
    issueDate: String,
    issuingOrganization: String,
    scores: {
      overall: String,
      listening: String,
      reading: String,
      writing: String,
      speaking: String
    }
  },
  ocrConfidence: {
    type: Number,
    min: 0,
    max: 100
  },
  processingTime: {
    type: Number // in milliseconds
  },
  errorMessage: String
}, {
  timestamps: true
})

// Index for better query performance
certificateSchema.index({ userId: 1, createdAt: -1 })
certificateSchema.index({ processingStatus: 1 })

module.exports = mongoose.model('Certificate', certificateSchema)