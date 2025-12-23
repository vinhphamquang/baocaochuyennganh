const { GoogleGenerativeAI } = require('@google/generative-ai')

/**
 * Gemini 2.5 Flash AI Service cho trích xuất chứng chỉ
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
        this.genAI = new GoogleGenerativeAI(this.apiKey)
        // Sử dụng gemini-1.5-pro model có sẵn
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
        console.log('✅ Gemini AI đã được khởi tạo thành công với model gemini-1.5-pro')
      } catch (error) {
        console.error('❌ Lỗi khởi tạo Gemini AI:', error.message)
        this.isConfigured = false
      }
    }
  }

  /**
   * Trích xuất thông tin chứng chỉ từ ảnh bằng Gemini AI
   */
  async extractCertificateInfo(imageBuffer, mimeType) {
    if (!this.isConfigured) {
      console.log('❌ Gemini không được cấu hình')
      throw new Error('Gemini API key not configured')
    }

    try {
      console.log('🤖 Đang phân tích chứng chỉ với Gemini 1.5 Pro...')
      
      const prompt = this.buildExtractionPrompt()
      
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      }

      const result = await this.model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      console.log('📝 Gemini raw response:', text)
      
      return this.parseGeminiResponse(text)
    } catch (error) {
      console.error('❌ Gemini AI Error:', error)
      
      // Không tự tạo mock data, throw error để fallback sang Tesseract
      throw error
    }
  }

  /**
   * Xây dựng prompt chi tiết cho Gemini với advanced techniques
   */
  buildExtractionPrompt() {
    return `
Bạn là một chuyên gia AI trích xuất thông tin chứng chỉ với độ chính xác cao. Hãy phân tích ảnh chứng chỉ này và trích xuất thông tin theo format JSON chính xác.

QUAN TRỌNG: 
- Chỉ trả về JSON hợp lệ, không có text giải thích thêm
- Nếu không chắc chắn về thông tin nào, để trống thay vì đoán
- Ưu tiên độ chính xác hơn độ đầy đủ

LOẠI CHỨNG CHỈ CẦN NHẬN DẠNG:
1. IELTS (International English Language Testing System)
   - Điểm: 0-9 (bước 0.5)
   - Kỹ năng: Listening, Reading, Writing, Speaking, Overall Band Score
   - Tổ chức: British Council, IDP Education, Cambridge Assessment

2. TOEFL iBT (Test of English as a Foreign Language)
   - Điểm: 0-30 mỗi kỹ năng, 0-120 tổng
   - Kỹ năng: Reading, Listening, Speaking, Writing
   - Tổ chức: ETS (Educational Testing Service)

3. TOEIC (Test of English for International Communication)
   - Điểm: 5-495 mỗi kỹ năng, 10-990 tổng
   - Kỹ năng: Listening, Reading
   - Tổ chức: ETS

4. VSTEP (Vietnamese Standardized Test of English Proficiency)
   - Điểm: 0-10 (bước 0.5)
   - Kỹ năng: Listening, Reading, Writing, Speaking, Overall
   - Tổ chức: Bộ Giáo dục và Đào tạo Việt Nam

5. HSK (Hanyu Shuiping Kaoshi - Chinese Proficiency Test)
   - Cấp độ: HSK 1-6
   - Điểm: 0-300 (HSK 1-3), 0-300 (HSK 4-6)

6. JLPT (Japanese Language Proficiency Test)
   - Cấp độ: N1, N2, N3, N4, N5
   - Kết quả: Pass/Fail với điểm chi tiết

THÔNG TIN CẦN TRÍCH XUẤT:

1. certificateType: Loại chứng chỉ chính xác (IELTS/TOEFL/TOEIC/VSTEP/HSK/JLPT/OTHER)

2. fullName: Họ và tên đầy đủ
   - Ưu tiên tên trên chứng chỉ chính thức
   - Định dạng: "FIRST MIDDLE LAST" hoặc "LAST, FIRST MIDDLE"
   - Loại bỏ ký tự đặc biệt, chỉ giữ chữ cái và khoảng trắng

3. dateOfBirth: Ngày sinh
   - Format: DD/MM/YYYY hoặc MM/DD/YYYY
   - Kiểm tra tính hợp lý (tuổi 10-100)

4. certificateNumber: Số chứng chỉ/mã số
   - IELTS: Test Report Form Number (thường 8-15 ký tự)
   - TOEFL: Registration Number
   - TOEIC: Registration Number
   - VSTEP: Certificate Number
   - Loại bỏ khoảng trắng, ký tự đặc biệt không cần thiết

5. examDate: Ngày thi
   - Format: DD/MM/YYYY
   - Phải sau ngày sinh và trước ngày hiện tại

6. issueDate: Ngày cấp chứng chỉ
   - Format: DD/MM/YYYY
   - Phải sau hoặc bằng ngày thi

7. issuingOrganization: Tổ chức cấp chứng chỉ
   - IELTS: "British Council", "IDP Education", "Cambridge Assessment English"
   - TOEFL/TOEIC: "ETS"
   - VSTEP: "Bộ Giáo dục và Đào tạo" hoặc tên trường đại học cụ thể

8. scores: Điểm số chi tiết (object)
   - Chỉ điền điểm số thực sự có trên chứng chỉ
   - Kiểm tra phạm vi hợp lệ cho từng loại chứng chỉ
   - IELTS: listening, reading, writing, speaking, overall (0-9, bước 0.5)
   - TOEFL: reading, listening, speaking, writing, total (0-30 mỗi skill, 0-120 total)
   - TOEIC: listening, reading, total (5-495 mỗi skill, 10-990 total)
   - VSTEP: listening, reading, writing, speaking, overall (0-10, bước 0.5)

9. confidence: Độ tin cậy (0-100)
   - Dựa trên độ rõ ràng của ảnh và tính đầy đủ của thông tin
   - 90-100: Ảnh rất rõ, thông tin đầy đủ và chắc chắn
   - 70-89: Ảnh rõ, hầu hết thông tin chắc chắn
   - 50-69: Ảnh khá rõ, một số thông tin có thể không chắc chắn
   - 30-49: Ảnh mờ hoặc thông tin khó đọc
   - 0-29: Ảnh rất mờ hoặc không thể đọc được

10. rawText: Toàn bộ text đã nhận dạng được (để debug)

VALIDATION RULES:
- Tên: 2-4 từ, mỗi từ 2-20 ký tự, chỉ chữ cái
- Ngày tháng: Phải hợp lệ và logic (sinh < thi < cấp)
- Điểm số: Phải trong phạm vi cho phép của từng loại chứng chỉ
- Số chứng chỉ: Độ dài và format phù hợp với loại chứng chỉ

OUTPUT FORMAT (JSON):
{
  "certificateType": "string",
  "fullName": "string", 
  "dateOfBirth": "string",
  "certificateNumber": "string",
  "examDate": "string",
  "issueDate": "string", 
  "issuingOrganization": "string",
  "scores": {
    "listening": number,
    "reading": number,
    "writing": number,
    "speaking": number,
    "overall": number,
    "total": number
  },
  "confidence": number,
  "extractionMethod": "gemini-ai",
  "rawText": "string"
}

SPECIAL INSTRUCTIONS:
- Nếu không tìm thấy thông tin, để trống string "" hoặc null
- Không đoán hoặc tạo ra thông tin không có
- Ưu tiên độ chính xác hơn độ đầy đủ
- Confidence score phải phản ánh chính xác độ tin cậy
- Kiểm tra cross-validation giữa các trường (ví dụ: tổng điểm = tổng các kỹ năng)
`
  }

  /**
   * Parse response từ Gemini AI
   */
  parseGeminiResponse(responseText) {
    try {
      // Làm sạch response text
      let cleanText = responseText.trim()
      
      // Tìm JSON trong response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanText = jsonMatch[0]
      }

      // Parse JSON
      const parsed = JSON.parse(cleanText)
      
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
          model: 'gemini-1.5-pro (mock)'
        }
      }

      // Test với prompt đơn giản
      const result = await this.model.generateContent('Hello')
      const response = await result.response
      
      return {
        status: 'healthy',
        message: 'Gemini AI service hoạt động bình thường',
        model: 'gemini-1.5-pro'
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