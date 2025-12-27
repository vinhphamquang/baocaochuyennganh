const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  certificateType: {
    type: String,
    required: true,
    enum: ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'HSK', 'JLPT', 'OTHER']
  },
  description: {
    type: String,
    trim: true
  },
  // Các pattern để nhận dạng
  patterns: {
    // Pattern để nhận dạng tên
    namePatterns: [{
      pattern: String,
      description: String,
      priority: { type: Number, default: 1 }
    }],
    // Pattern để nhận dạng ngày sinh
    dobPatterns: [{
      pattern: String,
      description: String,
      priority: { type: Number, default: 1 }
    }],
    // Pattern để nhận dạng số chứng chỉ
    certificateNumberPatterns: [{
      pattern: String,
      description: String,
      priority: { type: Number, default: 1 }
    }],
    // Pattern để nhận dạng ngày thi
    examDatePatterns: [{
      pattern: String,
      description: String,
      priority: { type: Number, default: 1 }
    }],
    // Pattern để nhận dạng điểm số
    scorePatterns: [{
      skill: String, // listening, reading, writing, speaking, overall, total
      pattern: String,
      description: String,
      minScore: Number,
      maxScore: Number,
      priority: { type: Number, default: 1 }
    }]
  },
  // Cấu hình điểm số
  scoreConfig: {
    skills: [String], // ['listening', 'reading', 'writing', 'speaking']
    hasOverall: { type: Boolean, default: true },
    hasTotal: { type: Boolean, default: false },
    minScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 9 },
    scoreType: { type: String, enum: ['decimal', 'integer'], default: 'decimal' }
  },
  // Ảnh mẫu
  sampleImages: [{
    filename: String,
    url: String,
    description: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Thống kê sử dụng
  usage: {
    totalProcessed: { type: Number, default: 0 },
    successfulExtractions: { type: Number, default: 0 },
    lastUsed: Date,
    averageConfidence: { type: Number, default: 0 }
  },
  // Trạng thái
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '1.0' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
certificateTemplateSchema.index({ certificateType: 1, isActive: 1 });
certificateTemplateSchema.index({ name: 'text', description: 'text' });

// Method để cập nhật thống kê
certificateTemplateSchema.methods.updateUsage = function(success, confidence) {
  this.usage.totalProcessed += 1;
  if (success) {
    this.usage.successfulExtractions += 1;
  }
  this.usage.lastUsed = new Date();
  
  // Cập nhật confidence trung bình
  const currentAvg = this.usage.averageConfidence || 0;
  const totalSuccess = this.usage.successfulExtractions;
  this.usage.averageConfidence = ((currentAvg * (totalSuccess - 1)) + confidence) / totalSuccess;
  
  return this.save();
};

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);