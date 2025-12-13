import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface CertificateData {
  fullName: string;
  dateOfBirth: string;
  certificateNumber: string;
  examDate: string;
  issueDate: string;
  issuingOrganization: string;
  certificateType: string;
  scores: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    overall?: number;
    [key: string]: number | undefined;
  };
  rawText: string;
  confidence: number;
  extractionMethod: 'tesseract' | 'ai-api' | 'hybrid';
  processingTime?: number;
}

/**
 * AI API Service cho nhận dạng chứng chỉ
 */
class CertificateAIService {
  private apiEndpoint = process.env.NEXT_PUBLIC_AI_OCR_API || 'http://localhost:5000/api/ai-ocr';
  
  /**
   * Gửi ảnh lên AI API để nhận dạng
   */
  async recognizeCertificate(imageFile: File): Promise<Partial<CertificateData>> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('type', 'certificate');
      
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }
      
      const result = await response.json();
      return this.parseAIResponse(result);
    } catch (error) {
      console.warn('AI API không khả dụng, fallback to Tesseract:', error);
      return {};
    }
  }
  
  /**
   * Parse response từ AI API
   */
  private parseAIResponse(response: any): Partial<CertificateData> {
    return {
      fullName: response.fullName || response.name,
      dateOfBirth: response.dateOfBirth || response.dob,
      certificateNumber: response.certificateNumber || response.certNumber,
      examDate: response.examDate || response.testDate,
      issueDate: response.issueDate,
      issuingOrganization: response.issuingOrganization || response.issuer,
      certificateType: response.certificateType || response.type,
      scores: response.scores || {},
      confidence: response.confidence || 0,
      extractionMethod: 'ai-api' as const
    };
  }
}

/**
 * Enhanced Tesseract OCR với AI patterns
 */
class EnhancedTesseractOCR {
  /**
   * Tiền xử lý ảnh với AI enhancement
   */
  private async preprocessImage(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Scale up for better OCR
        const scale = 3;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }
        
        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Advanced image processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply multiple filters
        this.applyContrastEnhancement(data);
        this.applyNoiseReduction(data, canvas.width, canvas.height);
        this.applySharpening(data, canvas.width, canvas.height);
        
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }
  
  /**
   * Cải thiện contrast và brightness
   */
  private applyContrastEnhancement(data: Uint8ClampedArray) {
    const contrast = 2.0;
    const brightness = 30;
    
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      // Apply contrast and brightness
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      let enhanced = factor * (gray - 128) + 128 + brightness;
      
      // Clamp and apply threshold
      enhanced = Math.max(0, Math.min(255, enhanced));
      const threshold = enhanced > 150 ? 255 : 0;
      
      data[i] = threshold;
      data[i + 1] = threshold;
      data[i + 2] = threshold;
    }
  }
  
  /**
   * Giảm noise
   */
  private applyNoiseReduction(data: Uint8ClampedArray, width: number, height: number) {
    // Simple median filter for noise reduction
    const original = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Get surrounding pixels
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            neighbors.push(original[nIdx]);
          }
        }
        
        // Apply median
        neighbors.sort((a, b) => a - b);
        const median = neighbors[4]; // Middle value
        
        data[idx] = median;
        data[idx + 1] = median;
        data[idx + 2] = median;
      }
    }
  }
  
  /**
   * Làm sắc nét
   */
  private applySharpening(data: Uint8ClampedArray, width: number, height: number) {
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    const original = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        let sum = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * width + (x + kx)) * 4;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += original[nIdx] * kernel[kernelIdx];
          }
        }
        
        sum = Math.max(0, Math.min(255, sum));
        data[idx] = sum;
        data[idx + 1] = sum;
        data[idx + 2] = sum;
      }
    }
  }
  
  /**
   * OCR với Tesseract nâng cao
   */
  async extractText(imageFile: File, onProgress?: (progress: OCRProgress) => void): Promise<string> {
    try {
      onProgress?.({ status: 'Đang tiền xử lý ảnh với AI...', progress: 0.1 });
      const processedImageUrl = await this.preprocessImage(imageFile);
      
      onProgress?.({ status: 'Đang khởi tạo Tesseract OCR...', progress: 0.2 });
      
      const result = await Tesseract.recognize(
        processedImageUrl,
        'eng+vie',
        {
          logger: (m) => {
            if (onProgress) {
              onProgress({
                status: m.status === 'recognizing text' ? 'Đang nhận dạng văn bản...' : m.status,
                progress: 0.2 + (m.progress || 0) * 0.8
              });
            }
          }
        }
      );
      
      URL.revokeObjectURL(processedImageUrl);
      return result.data.text;
    } catch (error) {
      console.error('Tesseract OCR Error:', error);
      throw new Error('Không thể đọc văn bản từ ảnh');
    }
  }
}

/**
 * AI-powered Information Extractor
 */
class AIInformationExtractor {
  /**
   * Trích xuất thông tin với AI patterns
   */
  extractInformation(text: string, certificateType?: string): Partial<CertificateData> {
    const cleanText = this.cleanText(text);
    console.log('🧹 Cleaned text for AI extraction:', cleanText);
    
    const data: Partial<CertificateData> = {
      rawText: text,
      confidence: 0,
      extractionMethod: 'tesseract'
    };
    
    // AI-powered certificate type detection
    data.certificateType = this.detectCertificateType(cleanText);
    if (data.certificateType) data.confidence = (data.confidence || 0) + 15;
    
    // AI-powered name extraction
    data.fullName = this.extractName(cleanText);
    if (data.fullName) data.confidence = (data.confidence || 0) + 25;
    
    // AI-powered date extraction
    const dates = this.extractDates(cleanText);
    data.dateOfBirth = dates.dateOfBirth;
    data.examDate = dates.examDate;
    data.issueDate = dates.issueDate;
    if (dates.dateOfBirth) data.confidence = (data.confidence || 0) + 15;
    if (dates.examDate) data.confidence = (data.confidence || 0) + 10;
    
    // AI-powered certificate number extraction
    data.certificateNumber = this.extractCertificateNumber(cleanText, data.certificateType);
    if (data.certificateNumber) data.confidence = (data.confidence || 0) + 20;
    
    // AI-powered issuing organization detection
    data.issuingOrganization = this.detectIssuingOrganization(cleanText, data.certificateType);
    if (data.issuingOrganization) data.confidence = (data.confidence || 0) + 10;
    
    // AI-powered score extraction
    data.scores = this.extractScores(cleanText, data.certificateType);
    const scoreCount = Object.keys(data.scores || {}).length;
    data.confidence = (data.confidence || 0) + scoreCount * 5;
    
    console.log(`🤖 AI Extraction confidence: ${data.confidence}%`);
    return data;
  }
  
  /**
   * Làm sạch text với AI
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, 'I')
      .replace(/[0O]/g, 'O')
      .replace(/[5S]/g, 'S')
      .replace(/[1Il]/g, 'I')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/[^\w\s.,:/\-()àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
      .trim();
  }
  
  /**
   * AI detection cho loại chứng chỉ
   */
  private detectCertificateType(text: string): string {
    const patterns = [
      { type: 'IELTS', keywords: ['ielts', 'international english language testing system'], weight: 10 },
      { type: 'TOEFL', keywords: ['toefl', 'test of english as a foreign language'], weight: 10 },
      { type: 'TOEIC', keywords: ['toeic', 'test of english for international communication'], weight: 10 },
      { type: 'VSTEP', keywords: ['vstep', 'vietnamese standardized test'], weight: 8 },
      { type: 'HSK', keywords: ['hsk', 'hanyu shuiping kaoshi', 'chinese proficiency'], weight: 8 },
      { type: 'JLPT', keywords: ['jlpt', 'japanese language proficiency test'], weight: 8 }
    ];
    
    let bestMatch = '';
    let maxScore = 0;
    
    for (const { type, keywords, weight } of patterns) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.toLowerCase().includes(keyword) ? weight : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = type;
      }
    }
    
    return bestMatch;
  }
  
  /**
   * AI extraction cho tên
   */
  private extractName(text: string): string {
    const patterns = [
      // IELTS specific
      /Candidate\s+Name[:\s]*([A-Z][A-Za-z\s]{5,50})/i,
      /Family\s+Name[:\s]*([A-Z]+)\s+First\s+Name[:\s]*([A-Z\s]+)/i,
      
      // General patterns
      /(?:Full\s+)?Name[:\s]*([A-Z][A-Za-z\s]{5,50})/i,
      /Họ\s+và\s+tên[:\s]*([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{5,50})/i,
      
      // Context-based
      /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s+(?:Date|DOB|Candidate)/i,
      
      // Loose pattern
      /\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('Family') && match[1] && match[2]) {
          const name = `${match[2].trim()} ${match[1].trim()}`;
          if (this.validateName(name)) return name;
        } else if (match[1]) {
          const name = match[1].trim();
          if (this.validateName(name)) return name;
        }
      }
    }
    
    return '';
  }
  
  /**
   * Validate tên
   */
  private validateName(name: string): boolean {
    const words = name.split(/\s+/);
    return words.length >= 2 && 
           words.every(word => word.length >= 2) && 
           name.length >= 5 && 
           name.length <= 50;
  }
  
  /**
   * AI extraction cho ngày tháng
   */
  private extractDates(text: string): { dateOfBirth?: string; examDate?: string; issueDate?: string } {
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
      /(\d{1,2}\s+[A-Z]{3}\s+\d{4})/gi,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g
    ];
    
    const dates: string[] = [];
    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1] && !dates.includes(match[1])) {
          dates.push(match[1]);
        }
      }
    }
    
    const result: { dateOfBirth?: string; examDate?: string; issueDate?: string } = {};
    
    // Context-based date assignment
    const dobKeywords = ['date of birth', 'dob', 'ngày sinh'];
    const examKeywords = ['date', 'test date', 'exam date', 'ngày thi'];
    const issueKeywords = ['issue date', 'date of issue', 'ngày cấp'];
    
    for (const date of dates) {
      const context = this.getDateContext(text, date);
      
      if (dobKeywords.some(keyword => context.toLowerCase().includes(keyword))) {
        result.dateOfBirth = date;
      } else if (issueKeywords.some(keyword => context.toLowerCase().includes(keyword))) {
        result.issueDate = date;
      } else if (examKeywords.some(keyword => context.toLowerCase().includes(keyword))) {
        result.examDate = date;
      } else if (!result.examDate) {
        result.examDate = date; // Default to exam date
      }
    }
    
    return result;
  }
  
  /**
   * Lấy context xung quanh ngày
   */
  private getDateContext(text: string, date: string): string {
    const index = text.indexOf(date);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + date.length + 50);
    return text.substring(start, end);
  }
  
  /**
   * AI extraction cho số chứng chỉ
   */
  private extractCertificateNumber(text: string, certificateType?: string): string {
    const patterns = [
      // IELTS specific
      /Form\s+Number[:\s]*([A-Z0-9]{8,20})/i,
      
      // General patterns
      /(?:Certificate|Cert)\s+(?:Number|No|#)[:\s]*([A-Z0-9\-]{6,20})/i,
      /(?:Registration|Reg)\s+(?:Number|No|#)[:\s]*([A-Z0-9\-]{6,20})/i,
      /Candidate\s+Number[:\s]*(\d{8,15})/i,
      
      // Pattern-based
      /\b([A-Z]{2,4}\d{6,12}[A-Z0-9]*)\b/,
      /\b(\d{2}[A-Z]{2}\d{6}[A-Z0-9]+)\b/,
      /\b([A-Z0-9]{10,20})\b/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const certNum = match[1].trim();
        if (this.validateCertificateNumber(certNum, certificateType)) {
          return certNum;
        }
      }
    }
    
    return '';
  }
  
  /**
   * Validate số chứng chỉ
   */
  private validateCertificateNumber(certNum: string, certificateType?: string): boolean {
    if (certNum.length < 6 || certNum.length > 20) return false;
    
    // Type-specific validation
    if (certificateType === 'IELTS') {
      return /^[A-Z0-9]{8,15}$/.test(certNum);
    }
    
    return /^[A-Z0-9\-]{6,20}$/.test(certNum);
  }
  
  /**
   * AI detection cho đơn vị cấp
   */
  private detectIssuingOrganization(text: string, certificateType?: string): string {
    const orgMap: Record<string, string[]> = {
      'IELTS': ['British Council', 'IDP', 'Cambridge'],
      'TOEFL': ['ETS', 'Educational Testing Service'],
      'TOEIC': ['ETS', 'Educational Testing Service'],
      'VSTEP': ['Bộ Giáo dục và Đào tạo', 'Ministry of Education'],
      'HSK': ['Hanban', 'Confucius Institute'],
      'JLPT': ['Japan Foundation', 'JEES']
    };
    
    if (certificateType && orgMap[certificateType]) {
      for (const org of orgMap[certificateType]) {
        if (text.toLowerCase().includes(org.toLowerCase())) {
          return org;
        }
      }
      return orgMap[certificateType][0]; // Default
    }
    
    // General detection
    const orgPatterns = [
      /(?:Issued by|Issuer)[:\s]*([A-Za-z\s]{5,50})/i,
      /(?:Organization|Org)[:\s]*([A-Za-z\s]{5,50})/i
    ];
    
    for (const pattern of orgPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return '';
  }
  
  /**
   * AI extraction cho điểm số
   */
  private extractScores(text: string, certificateType?: string): any {
    const scores: any = {};
    
    if (certificateType === 'IELTS') {
      return this.extractIELTSScores(text);
    } else if (certificateType === 'TOEIC') {
      return this.extractTOEICScores(text);
    } else if (certificateType === 'TOEFL') {
      return this.extractTOEFLScores(text);
    }
    
    return this.extractGeneralScores(text);
  }
  
  /**
   * Extract IELTS scores
   */
  private extractIELTSScores(text: string): any {
    const scores: any = {};
    
    const skillPatterns = {
      listening: [/Listening[:\s]*(\d+\.?\d*)/i, /L[:\s]*(\d+\.?\d*)/i],
      reading: [/Reading[:\s]*(\d+\.?\d*)/i, /R[:\s]*(\d+\.?\d*)/i],
      writing: [/Writing[:\s]*(\d+\.?\d*)/i, /W[:\s]*(\d+\.?\d*)/i],
      speaking: [/Speaking[:\s]*(\d+\.?\d*)/i, /S[:\s]*(\d+\.?\d*)/i]
    };
    
    for (const [skill, patterns] of Object.entries(skillPatterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const score = parseFloat(match[1]);
          if (score >= 0 && score <= 9) {
            scores[skill] = score;
            break;
          }
        }
      }
    }
    
    // Overall band score
    const overallPatterns = [
      /Overall Band Score[:\s]*(\d+\.?\d*)/i,
      /Band[:\s]*(\d+\.?\d*)/i,
      /Overall[:\s]*(\d+\.?\d*)/i
    ];
    
    for (const pattern of overallPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 9) {
          scores.overall = score;
          break;
        }
      }
    }
    
    return scores;
  }
  
  /**
   * Extract TOEIC scores
   */
  private extractTOEICScores(text: string): any {
    const scores: any = {};
    
    const patterns = [
      /Total Score[:\s]*(\d{3,4})/i,
      /Score[:\s]*(\d{3,4})/i,
      /Listening[:\s]*(\d{2,3})/i,
      /Reading[:\s]*(\d{2,3})/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 10 && score <= 990) {
          if (pattern.source.includes('Total') || pattern.source.includes('Score')) {
            scores.overall = score;
          } else if (pattern.source.includes('Listening')) {
            scores.listening = score;
          } else if (pattern.source.includes('Reading')) {
            scores.reading = score;
          }
        }
      }
    }
    
    return scores;
  }
  
  /**
   * Extract TOEFL scores
   */
  private extractTOEFLScores(text: string): any {
    const scores: any = {};
    
    const skillPatterns = {
      reading: /Reading[:\s]*(\d{1,2})/i,
      listening: /Listening[:\s]*(\d{1,2})/i,
      speaking: /Speaking[:\s]*(\d{1,2})/i,
      writing: /Writing[:\s]*(\d{1,2})/i
    };
    
    for (const [skill, pattern] of Object.entries(skillPatterns)) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 0 && score <= 30) {
          scores[skill] = score;
        }
      }
    }
    
    // Total score
    const totalPattern = /Total[:\s]*(\d{2,3})/i;
    const totalMatch = text.match(totalPattern);
    if (totalMatch) {
      const score = parseInt(totalMatch[1]);
      if (score >= 0 && score <= 120) {
        scores.overall = score;
      }
    }
    
    return scores;
  }
  
  /**
   * Extract general scores
   */
  private extractGeneralScores(text: string): any {
    const scores: any = {};
    
    const patterns = [
      /Score[:\s]*(\d+\.?\d*)/i,
      /Total[:\s]*(\d+\.?\d*)/i,
      /Overall[:\s]*(\d+\.?\d*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 1000) {
          scores.overall = score;
          break;
        }
      }
    }
    
    return scores;
  }
}

/**
 * Main OCR-AI Hybrid System
 */
export class OCRAIHybridSystem {
  private aiService = new CertificateAIService();
  private tesseractOCR = new EnhancedTesseractOCR();
  private aiExtractor = new AIInformationExtractor();
  
  /**
   * Xử lý chứng chỉ với hybrid approach
   */
  async processCertificate(
    imageFile: File,
    onProgress?: (progress: OCRProgress) => void
  ): Promise<CertificateData> {
    console.log('🚀 Starting OCR-AI Hybrid processing...');
    
    try {
      // Bước 1: Thử AI API trước
      onProgress?.({ status: 'Đang kết nối AI API...', progress: 0.1 });
      
      const aiResult = await this.aiService.recognizeCertificate(imageFile);
      
      if (aiResult.confidence && aiResult.confidence > 80) {
        console.log('✅ AI API thành công với confidence cao:', aiResult.confidence);
        onProgress?.({ status: 'Hoàn thành với AI API', progress: 1.0 });
        return aiResult as CertificateData;
      }
      
      // Bước 2: Fallback to Enhanced Tesseract
      console.log('🔄 AI API không đủ tin cậy, chuyển sang Tesseract...');
      onProgress?.({ status: 'Chuyển sang Tesseract OCR...', progress: 0.3 });
      
      const ocrText = await this.tesseractOCR.extractText(imageFile, (progress) => {
        onProgress?.({
          status: progress.status,
          progress: 0.3 + progress.progress * 0.5
        });
      });
      
      // Bước 3: AI-powered information extraction
      onProgress?.({ status: 'Đang phân tích với AI...', progress: 0.8 });
      
      const tesseractResult = this.aiExtractor.extractInformation(ocrText);
      
      // Bước 4: Hybrid merge nếu có cả 2 kết quả
      let finalResult: CertificateData;
      
      if (aiResult.confidence && aiResult.confidence > 50) {
        console.log('🔀 Merging AI API và Tesseract results...');
        finalResult = this.mergeResults(aiResult, tesseractResult);
        finalResult.extractionMethod = 'hybrid';
      } else {
        finalResult = tesseractResult as CertificateData;
        finalResult.extractionMethod = 'tesseract';
      }
      
      onProgress?.({ status: 'Hoàn thành xử lý', progress: 1.0 });
      
      console.log('✅ Final result:', finalResult);
      return finalResult;
      
    } catch (error) {
      console.error('❌ OCR-AI Hybrid Error:', error);
      throw new Error('Không thể xử lý chứng chỉ');
    }
  }
  
  /**
   * Merge kết quả từ AI API và Tesseract
   */
  private mergeResults(
    aiResult: Partial<CertificateData>,
    tesseractResult: Partial<CertificateData>
  ): CertificateData {
    const merged: CertificateData = {
      fullName: aiResult.fullName || tesseractResult.fullName || '',
      dateOfBirth: aiResult.dateOfBirth || tesseractResult.dateOfBirth || '',
      certificateNumber: aiResult.certificateNumber || tesseractResult.certificateNumber || '',
      examDate: aiResult.examDate || tesseractResult.examDate || '',
      issueDate: aiResult.issueDate || tesseractResult.issueDate || '',
      issuingOrganization: aiResult.issuingOrganization || tesseractResult.issuingOrganization || '',
      certificateType: aiResult.certificateType || tesseractResult.certificateType || '',
      scores: { ...tesseractResult.scores, ...aiResult.scores },
      rawText: tesseractResult.rawText || '',
      confidence: Math.max(aiResult.confidence || 0, tesseractResult.confidence || 0),
      extractionMethod: 'hybrid'
    };
    
    // Tính lại confidence dựa trên số field được điền
    const filledFields = Object.values(merged).filter(value => 
      value && (typeof value === 'string' ? value.trim() : true)
    ).length;
    
    merged.confidence = Math.min(95, (filledFields / 8) * 100);
    
    return merged;
  }
}

// Export main functions
export const ocrAIHybrid = new OCRAIHybridSystem();

export async function processImageWithAI(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<CertificateData> {
  return ocrAIHybrid.processCertificate(imageFile, onProgress);
}