const { GoogleGenAI } = require('@google/genai')

/**
 * Gemini 3 Flash Preview AI Service cho trích xuất chứng chỉ
 * Theo tài liệu chính thức: https://ai.google.dev/gemini-api/docs/image-understanding
 */
class GeminiCertificateExtractor {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    console.log('🔑 Gemini API Key check:', this.apiKey ? `Found (${this.apiKey.substring(0, 10)}...)` : 'Not found')
    this.isConfigured = !!this.apiKey && this.apiKey !== 'your-gemini-api-key-here'
    
    if (!this.isConfigured) {
      console.warn('⚠️ GEMINI_API_KEY không được cấu hình - sử dụng mock mode')
    } else {
      try {
        // Khởi tạo GoogleGenAI client theo tài liệu chính thức
        this.ai = new GoogleGenAI({ apiKey: this.apiKey })
        console.log('✅ Gemini AI đã được khởi tạo thành công với gemini-3-flash-preview')
      } catch (error) {
        console.error('❌ Lỗi khởi tạo Gemini AI:', error.message)
        this.isConfigured = false
      }
    }
  }

  /**
   * Trích xuất thông tin chứng chỉ từ ảnh bằng Gemini AI
   * Theo tài liệu: 
   * - Passing inline image data
   * - Structured Outputs với JSON Schema
   * - Thinking Config (HIGH level cho độ chính xác cao)
   * - Media Resolution (HIGH cho ảnh chất lượng cao)
   */
  async extractCertificateInfo(imageBuffer, mimeType) {
    if (!this.isConfigured) {
      console.log('❌ Gemini không được cấu hình')
      throw new Error('Gemini API key not configured')
    }

    try {
      console.log('🤖 Đang phân tích chứng chỉ với Gemini 3 Flash Preview...')
      
      const prompt = this.buildExtractionPrompt()
      
      // Convert buffer to base64 theo tài liệu chính thức
      const base64ImageData = imageBuffer.toString('base64')
      
      // Tạo contents array theo đúng format tài liệu
      const contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
          },
        },
        { text: prompt }
      ]

      // Định nghĩa JSON Schema theo tài liệu chính thức
      const certificateSchema = this.getCertificateJsonSchema()

      // Gọi generateContent với structured output, thinking và media resolution
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          thinkingConfig: {
            thinkingLevel: 'HIGH',
          },
          mediaResolution: 'MEDIA_RESOLUTION_HIGH',
          responseMimeType: 'application/json',
          responseJsonSchema: certificateSchema,
        },
      })

      console.log('📝 Gemini raw response:', response.text)
      
      // Parse JSON response trực tiếp
      const parsed = JSON.parse(response.text)
      
      // Validate và chuẩn hóa dữ liệu
      return this.validateAndNormalize(parsed)
    } catch (error) {
      console.error('❌ Gemini AI Error:', error)
      
      // Không tự tạo mock data, throw error để fallback sang Tesseract
      throw error
    }
  }

  /**
   * Định nghĩa JSON Schema cho certificate extraction
   * Theo tài liệu: https://ai.google.dev/gemini-api/docs/structured-output
   */
  getCertificateJsonSchema() {
    return {
      type: 'object',
      properties: {
        certificateType: {
          type: 'string',
          description: 'Loại chứng chỉ (IELTS/TOEFL/TOEIC/VSTEP/HSK/JLPT/OTHER)',
          enum: ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'HSK', 'JLPT', 'OTHER']
        },
        fullName: {
          type: 'string',
          description: 'Họ và tên đầy đủ của người được cấp chứng chỉ'
        },
        dateOfBirth: {
          type: 'string',
          description: 'Ngày sinh (format: DD/MM/YYYY hoặc MM/DD/YYYY)'
        },
        certificateNumber: {
          type: 'string',
          description: 'Số chứng chỉ hoặc mã số đăng ký'
        },
        examDate: {
          type: 'string',
          description: 'Ngày thi (format: DD/MM/YYYY)'
        },
        issueDate: {
          type: 'string',
          description: 'Ngày cấp chứng chỉ (format: DD/MM/YYYY)'
        },
        issuingOrganization: {
          type: 'string',
          description: 'Tổ chức cấp chứng chỉ (British Council, IDP, ETS, etc.)'
        },
        scores: {
          type: 'object',
          description: 'Điểm số chi tiết theo từng kỹ năng',
          properties: {
            listening: {
              type: 'number',
              description: 'Điểm Listening'
            },
            reading: {
              type: 'number',
              description: 'Điểm Reading'
            },
            writing: {
              type: 'number',
              description: 'Điểm Writing'
            },
            speaking: {
              type: 'number',
              description: 'Điểm Speaking'
            },
            overall: {
              type: 'number',
              description: 'Điểm tổng hoặc Overall Band Score'
            },
            total: {
              type: 'number',
              description: 'Tổng điểm (cho TOEIC/TOEFL)'
            }
          }
        },
        confidence: {
          type: 'integer',
          description: 'Độ tin cậy của việc trích xuất (0-100)',
          minimum: 0,
          maximum: 100
        },
        rawText: {
          type: 'string',
          description: 'Toàn bộ text nhận dạng được từ ảnh'
        }
      },
      required: ['certificateType', 'fullName', 'scores', 'confidence']
    }
  }

  /**
   * Xây dựng prompt chi tiết cho Gemini với structured output
   */
  buildExtractionPrompt() {
    return `Phân tích ảnh chứng chỉ này và trích xuất thông tin chính xác.

LOẠI CHỨNG CHỈ:
- IELTS: Điểm 0-9 (Listening, Reading, Writing, Speaking, Overall)
- TOEFL: Điểm 0-30/skill, 0-120 total
- TOEIC: Điểm 5-495/skill, 10-990 total
- VSTEP: Điểm 0-10 (Listening, Reading, Writing, Speaking, Overall)
- HSK: Cấp độ 1-6
- JLPT: Cấp độ N1-N5

HƯỚNG DẪN:
1. Nhận dạng chính xác loại chứng chỉ
2. Trích xuất họ tên đầy đủ (viết hoa)
3. Tìm số chứng chỉ/mã đăng ký
4. Trích xuất tất cả ngày tháng (sinh, thi, cấp)
5. Xác định tổ chức cấp chứng chỉ
6. Trích xuất điểm số chi tiết theo từng kỹ năng
7. Đánh giá độ tin cậy dựa trên độ rõ ảnh

LƯU Ý:
- Nếu không tìm thấy thông tin, để trống string ""
- Không đoán hoặc tạo thông tin không có
- Confidence: 90-100 (rất rõ), 70-89 (rõ), 50-69 (khá rõ), <50 (mờ)
- Trích xuất toàn bộ text nhận dạng được vào rawText`
  }

  /**
   * Parse response từ Gemini AI (với structured output, response đã là JSON hợp lệ)
   */
  parseGeminiResponse(responseText) {
    try {
      // Với structured output, response đã là JSON hợp lệ
      const parsed = JSON.parse(responseText)
      
      // Validate và chuẩn hóa dữ liệu
      return this.validateAndNormalize(parsed)
    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error)
      console.log('Raw response:', responseText)
      
      // Fallback: thử extract thông tin cơ bản
      return this.fallbackExtraction(responseText)
    }
  }

  /**
   * Validate và chuẩn hóa dữ liệu từ Gemini
   */
  validateAndNormalize(data) {
    const normalized = {
      certificateType: this.validateCertificateType(data.certificateType),
      fullName: this.validateName(data.fullName),
      dateOfBirth: this.validateDate(data.dateOfBirth),
      certificateNumber: this.validateCertificateNumber(data.certificateNumber),
      examDate: this.validateDate(data.examDate),
      issueDate: this.validateDate(data.issueDate),
      issuingOrganization: this.validateOrganization(data.issuingOrganization),
      scores: this.validateScores(data.scores, data.certificateType),
      confidence: this.validateConfidence(data.confidence),
      extractionMethod: 'gemini-ai',
      rawText: data.rawText || '',
      processingTime: Date.now()
    }

    // Tính lại confidence dựa trên số field được điền
    normalized.confidence = this.calculateConfidence(normalized)
    
    console.log('✅ Gemini normalized result:', normalized)
    return normalized
  }

  /**
   * Validate loại chứng chỉ
   */
  validateCertificateType(type) {
    const validTypes = ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'HSK', 'JLPT', 'OTHER']
    return validTypes.includes(type) ? type : 'OTHER'
  }

  /**
   * Validate tên
   */
  validateName(name) {
    if (!name || typeof name !== 'string') return ''
    const cleaned = name.trim().toUpperCase()
    return cleaned.length >= 2 && cleaned.length <= 100 ? cleaned : ''
  }

  /**
   * Validate ngày tháng
   */
  validateDate(date) {
    if (!date || typeof date !== 'string') return ''
    
    // Các format được chấp nhận
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/
    ]
    
    return datePatterns.some(pattern => pattern.test(date.trim())) ? date.trim() : ''
  }

  /**
   * Validate số chứng chỉ
   */
  validateCertificateNumber(certNum) {
    if (!certNum || typeof certNum !== 'string') return ''
    const cleaned = certNum.trim()
    return cleaned.length >= 3 && cleaned.length <= 50 ? cleaned : ''
  }

  /**
   * Validate tổ chức cấp
   */
  validateOrganization(org) {
    if (!org || typeof org !== 'string') return ''
    const cleaned = org.trim()
    return cleaned.length >= 2 && cleaned.length <= 100 ? cleaned : ''
  }

  /**
   * Validate điểm số theo loại chứng chỉ
   */
  validateScores(scores, certificateType) {
    if (!scores || typeof scores !== 'object') return {}
    
    const validated = {}
    
    switch (certificateType) {
      case 'IELTS':
        // IELTS: 0-9 điểm
        if (scores.listening >= 0 && scores.listening <= 9) validated.listening = scores.listening
        if (scores.reading >= 0 && scores.reading <= 9) validated.reading = scores.reading
        if (scores.writing >= 0 && scores.writing <= 9) validated.writing = scores.writing
        if (scores.speaking >= 0 && scores.speaking <= 9) validated.speaking = scores.speaking
        if (scores.overall >= 0 && scores.overall <= 9) validated.overall = scores.overall
        break
        
      case 'TOEFL':
        // TOEFL: 0-30 mỗi skill, 0-120 total
        if (scores.reading >= 0 && scores.reading <= 30) validated.reading = scores.reading
        if (scores.listening >= 0 && scores.listening <= 30) validated.listening = scores.listening
        if (scores.speaking >= 0 && scores.speaking <= 30) validated.speaking = scores.speaking
        if (scores.writing >= 0 && scores.writing <= 30) validated.writing = scores.writing
        if (scores.total >= 0 && scores.total <= 120) validated.total = scores.total
        break
        
      case 'TOEIC':
        // TOEIC: 5-495 mỗi skill, 10-990 total
        if (scores.listening >= 5 && scores.listening <= 495) validated.listening = scores.listening
        if (scores.reading >= 5 && scores.reading <= 495) validated.reading = scores.reading
        if (scores.total >= 10 && scores.total <= 990) validated.total = scores.total
        break
        
      case 'VSTEP':
        // VSTEP: 0-10 điểm
        if (scores.listening >= 0 && scores.listening <= 10) validated.listening = scores.listening
        if (scores.reading >= 0 && scores.reading <= 10) validated.reading = scores.reading
        if (scores.writing >= 0 && scores.writing <= 10) validated.writing = scores.writing
        if (scores.speaking >= 0 && scores.speaking <= 10) validated.speaking = scores.speaking
        if (scores.overall >= 0 && scores.overall <= 10) validated.overall = scores.overall
        break
        
      default:
        // Generic validation
        Object.keys(scores).forEach(key => {
          const score = scores[key]
          if (typeof score === 'number' && score >= 0 && score <= 1000) {
            validated[key] = score
          }
        })
    }
    
    return validated
  }

  /**
   * Validate confidence score
   */
  validateConfidence(confidence) {
    if (typeof confidence !== 'number') return 50
    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Tính confidence dựa trên số field được điền
   */
  calculateConfidence(data) {
    let score = 0
    let maxScore = 0
    
    // Các field quan trọng và trọng số
    const fields = {
      certificateType: 15,
      fullName: 25,
      certificateNumber: 20,
      examDate: 10,
      dateOfBirth: 10,
      issuingOrganization: 10,
      scores: 10
    }
    
    Object.keys(fields).forEach(field => {
      maxScore += fields[field]
      
      if (field === 'scores') {
        const scoreCount = Object.keys(data.scores || {}).length
        if (scoreCount > 0) score += fields[field]
      } else if (data[field] && data[field] !== '') {
        score += fields[field]
      }
    })
    
    return Math.round((score / maxScore) * 100)
  }

  /**
   * Fallback extraction khi parse JSON thất bại
   */
  fallbackExtraction(text) {
    console.log('🔄 Fallback extraction from Gemini response...')
    
    return {
      certificateType: this.extractCertificateTypeFromText(text),
      fullName: this.extractNameFromText(text),
      dateOfBirth: '',
      certificateNumber: this.extractCertNumberFromText(text),
      examDate: '',
      issueDate: '',
      issuingOrganization: '',
      scores: {},
      confidence: 30,
      extractionMethod: 'gemini-ai-fallback',
      rawText: text,
      processingTime: Date.now()
    }
  }

  /**
   * Extract certificate type từ text
   */
  extractCertificateTypeFromText(text) {
    const types = ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP', 'HSK', 'JLPT']
    for (const type of types) {
      if (text.toUpperCase().includes(type)) {
        return type
      }
    }
    return 'OTHER'
  }

  /**
   * Extract name từ text
   */
  extractNameFromText(text) {
    const namePattern = /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)/
    const match = text.match(namePattern)
    return match ? match[1] : ''
  }

  /**
   * Extract certificate number từ text
   */
  extractCertNumberFromText(text) {
    const certPattern = /([A-Z0-9]{6,20})/
    const match = text.match(certPattern)
    return match ? match[1] : ''
  }

  /**
   * Tạo mock result chất lượng cao khi Gemini không khả dụng
   */
  generateMockResult(mimeType) {
    console.log('🎭 Generating high-quality mock Gemini result...')
    
    // Tạo dữ liệu mock đa dạng dựa trên thời gian
    const mockVariants = [
      {
        certificateType: 'IELTS',
        fullName: 'NGUYEN VAN MINH',
        dateOfBirth: '15/03/1995',
        certificateNumber: 'IELTS2023VN001',
        examDate: '12/10/2023',
        issueDate: '25/10/2023',
        issuingOrganization: 'British Council Vietnam',
        scores: {
          listening: 8.0,
          reading: 7.5,
          writing: 7.0,
          speaking: 8.5,
          overall: 7.5
        },
        confidence: 92,
        rawText: 'IELTS Test Report Form - Candidate Name: NGUYEN VAN MINH - Overall Band Score: 7.5'
      },
      {
        certificateType: 'TOEIC',
        fullName: 'TRAN THI LINH',
        dateOfBirth: '20/08/1992',
        certificateNumber: 'TOEIC2023VN789',
        examDate: '05/11/2023',
        issueDate: '15/11/2023',
        issuingOrganization: 'ETS Global',
        scores: {
          listening: 450,
          reading: 420,
          total: 870
        },
        confidence: 88,
        rawText: 'TOEIC Listening and Reading Test - Total Score: 870 - Listening: 450 - Reading: 420'
      },
      {
        certificateType: 'VSTEP',
        fullName: 'LE HOANG NAM',
        dateOfBirth: '10/12/1994',
        certificateNumber: 'VSTEP2023HN456',
        examDate: '20/09/2023',
        issueDate: '30/09/2023',
        issuingOrganization: 'Đại học Quốc gia Hà Nội',
        scores: {
          listening: 8.5,
          reading: 8.0,
          writing: 7.5,
          speaking: 8.0,
          overall: 8.0
        },
        confidence: 90,
        rawText: 'VSTEP Certificate - Overall Score: 8.0 - Listening: 8.5 - Reading: 8.0 - Writing: 7.5 - Speaking: 8.0'
      }
    ];
    
    // Chọn variant dựa trên thời gian để tạo sự đa dạng
    const variantIndex = Math.floor(Date.now() / 10000) % mockVariants.length;
    const selectedVariant = mockVariants[variantIndex];
    
    return {
      ...selectedVariant,
      extractionMethod: 'gemini-ai-mock',
      processingTime: 1.2 + Math.random() * 0.8,
      timestamp: new Date().toISOString(),
      mockNote: 'Dữ liệu demo chất lượng cao - API Gemini tạm thời không khả dụng do quota'
    }
  }

  /**
   * Kiểm tra trạng thái service
   */
  async healthCheck() {
    try {
      if (!this.isConfigured) {
        return {
          status: 'mock',
          message: 'Gemini API key chưa cấu hình - đang chạy mock mode',
          model: 'gemini-3-flash-preview (mock)'
        }
      }

      // Test với prompt đơn giản theo tài liệu chính thức
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: 'Hello, respond with a simple greeting.' }],
        config: {
          thinkingConfig: {
            thinkingLevel: 'LOW',
          },
        },
      })
      
      return {
        status: 'healthy',
        message: 'Gemini AI service hoạt động bình thường',
        model: 'gemini-3-flash-preview',
        features: {
          thinkingConfig: 'enabled',
          mediaResolution: 'MEDIA_RESOLUTION_HIGH',
          structuredOutput: 'enabled'
        },
        responseText: response.text
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Gemini AI service lỗi: ${error.message}`,
        fallbackMode: true
      }
    }
  }
}

module.exports = GeminiCertificateExtractor
