import Tesseract from 'tesseract.js';
import { processLowResolutionImage, ExtractedData as LowResExtractedData } from './ocr-low-resolution-enhancer';

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface ExtractedData {
  fullName: string;
  dateOfBirth: string;
  certificateNumber: string;
  examDate: string;
  issueDate: string;
  scores: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
    overall?: number;
  };
  certificateType: string;
  rawText: string;
  imageQuality?: 'low' | 'medium' | 'high';
  enhancementApplied?: string[];
  confidence?: number;
}

/**
 * Phân tích chất lượng ảnh để quyết định phương pháp xử lý
 */
async function analyzeImageQuality(imageFile: File): Promise<{
  quality: 'low' | 'medium' | 'high';
  shouldUseEnhancement: boolean;
  pixelDensity: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const pixelDensity = img.width * img.height;
      let quality: 'low' | 'medium' | 'high' = 'medium';
      let shouldUseEnhancement = false;
      
      // Phân tích dựa trên kích thước và tỷ lệ
      if (pixelDensity < 500000 || Math.min(img.width, img.height) < 600) {
        quality = 'low';
        shouldUseEnhancement = true;
      } else if (pixelDensity > 3000000 && Math.min(img.width, img.height) > 1500) {
        quality = 'high';
        // Thay đổi: Vẫn cho phép enhancement cho ảnh chất lượng cao nếu cần
        shouldUseEnhancement = false; // Sẽ được quyết định bởi fallback logic
      } else {
        quality = 'medium';
        shouldUseEnhancement = true; // Luôn sử dụng enhancement cho medium quality
      }
      
      console.log(`📊 Image analysis: ${img.width}x${img.height}, quality: ${quality}, enhancement: ${shouldUseEnhancement}`);
      
      resolve({
        quality,
        shouldUseEnhancement,
        pixelDensity
      });
    };
    
    img.onerror = () => reject(new Error('Failed to analyze image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Tiền xử lý ảnh để cải thiện OCR (phiên bản cơ bản)
 */
async function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx?.drawImage(img, 0, 0);
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply image enhancements
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const enhancedGray = factor * (gray - 128) + 128;
        
        // Apply threshold for better text recognition
        const threshold = enhancedGray > 128 ? 255 : 0;
        
        data[i] = threshold;     // Red
        data[i + 1] = threshold; // Green
        data[i + 2] = threshold; // Blue
        // Alpha stays the same
      }
      
      // Put processed image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to blob URL
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
 * Trích xuất văn bản từ ảnh sử dụng Tesseract.js OCR với cải tiến
 */
export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    // Preprocess image for better OCR
    onProgress?.({ status: 'Đang tiền xử lý ảnh...', progress: 0.1 });
    const processedImageUrl = await preprocessImage(imageFile);
    
    onProgress?.({ status: 'Đang khởi tạo OCR engine...', progress: 0.2 });
    
    const result = await Tesseract.recognize(
      processedImageUrl,
      'eng+vie', // Hỗ trợ cả tiếng Anh và tiếng Việt
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

    // Clean up blob URL
    URL.revokeObjectURL(processedImageUrl);
    
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Không thể đọc văn bản từ ảnh');
  }
}

/**
 * Phân tích văn bản và trích xuất thông tin chứng chỉ với cải thiện pattern matching
 */
export function parseExtractedText(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {
    rawText: text
  };

  console.log('🔍 Parsing text:', text.substring(0, 200) + '...');

  // Xác định loại chứng chỉ với nhiều pattern hơn
  const certTypes = [
    { type: 'IELTS', patterns: ['IELTS', 'International English Language Testing System', 'Test Report Form', 'Band Score'] },
    { type: 'TOEIC', patterns: ['TOEIC', 'Test of English for International Communication', 'Listening and Reading'] },
    { type: 'TOEFL', patterns: ['TOEFL', 'Test of English as a Foreign Language', 'iBT', 'ETS'] },
    { type: 'VSTEP', patterns: ['VSTEP', 'Vietnamese Standardized Test', 'Bộ Giáo dục'] }
  ];
  
  for (const { type, patterns } of certTypes) {
    if (patterns.some(pattern => text.toUpperCase().includes(pattern.toUpperCase()))) {
      data.certificateType = type;
      console.log('🎯 Certificate type detected:', type);
      break;
    }
  }

  // Trích xuất tên với nhiều pattern hơn
  const namePatterns = [
    // IELTS specific patterns
    /Family\s+Name[:\s]*([A-Z]+)\s+First\s+Name[:\s]*([A-Z\s]+)/i,
    /Candidate\s+Name[:\s]*([A-Z][A-Za-z\s]{3,50})/i,
    
    // General patterns
    /(?:Full\s+)?Name[:\s]*([A-Z][A-Za-z\s]{3,50})(?:\s|$)/i,
    /Họ\s+và\s+tên[:\s]*([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{3,50})/i,
    
    // Context-based patterns
    /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s+(?:Date|DOB|Candidate|Form|Test)/i,
    
    // Loose patterns for difficult cases
    /\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/g
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      let name = '';
      
      // Handle IELTS Family + First name format
      if (pattern.source.includes('Family') && match[1] && match[2]) {
        name = `${match[2].trim()} ${match[1].trim()}`;
      } else if (match[1]) {
        name = match[1].trim();
      }
      
      // Validate name quality
      if (name && validateName(name)) {
        data.fullName = name;
        console.log('✅ Name extracted:', name);
        break;
      }
    }
  }

  // Trích xuất ngày sinh với nhiều format hơn
  const dobPatterns = [
    /Date\s+of\s+Birth[:\s|]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /DOB[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Ngày\s+sinh[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}).*(?:birth|DOB|sinh)/i
  ];
  
  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.dateOfBirth = match[1];
      console.log('✅ Date of birth extracted:', match[1]);
      break;
    }
  }

  // Trích xuất số chứng chỉ với nhiều pattern hơn
  const certNumPatterns = [
    // IELTS specific
    /(?:Test\s+Report\s+)?Form\s+Number[:\s]*([A-Z0-9]{6,20})/i,
    /Form[:\s]*([A-Z0-9]{6,20})/i,
    
    // General patterns
    /(?:Certificate|Cert)\s+(?:Number|No|#)[:\s]*([A-Z0-9\-]{6,20})/i,
    /(?:Registration|Reg)\s+(?:Number|No|#)[:\s]*([A-Z0-9\-]{6,20})/i,
    /Candidate\s+Number[:\s]*(\d{6,15})/i,
    /(?:ID|Identification)[:\s]*([A-Z0-9\-]{6,20})/i,
    
    // Pattern-based extraction
    /\b([A-Z]{2,4}\d{6,12}[A-Z0-9]*)\b/,
    /\b(\d{2}[A-Z]{2}\d{6}[A-Z0-9]+)\b/,
    /\b([A-Z0-9]{8,20})\b/
  ];
  
  for (const pattern of certNumPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const certNum = match[1].trim();
      if (validateCertNumber(certNum)) {
        data.certificateNumber = certNum;
        console.log('✅ Certificate number extracted:', certNum);
        break;
      }
    }
  }

  // Trích xuất ngày thi với nhiều pattern hơn
  const examDatePatterns = [
    /Test\s+Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Exam\s+Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Date[:\s|]*(\d{1,2}[\/\-][A-Z]{3}[\/\-]\d{4})/i, // 15/APR/2023
    /Date[:\s|]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Test\s+Report\s+Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Ngày\s+thi[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of examDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.examDate = match[1];
      console.log('✅ Exam date extracted:', match[1]);
      break;
    }
  }

  // Trích xuất ngày cấp
  const issueDatePatterns = [
    /(?:Issue\s+Date|Date\s+of\s+Issue|Issued)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Ngày\s+cấp[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of issueDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.issueDate = match[1];
      console.log('✅ Issue date extracted:', match[1]);
      break;
    }
  }

  // Trích xuất điểm số với cải thiện
  data.scores = {};
  
  // Helper function: Chuyển điểm từ scale 0-100 sang 0-9
  const convertScore = (score: number): number => {
    if (score >= 10) {
      // Scale 0-100 → 0-9
      return score / 10;
    }
    // Đã là scale 0-9
    return score;
  };
  
  // IELTS scores với nhiều pattern hơn
  const skillPatterns = {
    listening: [
      /Listening[:\s|]*(\d+\.?\d*)/i,
      /L[:\s|]*(\d+\.?\d*)/i,
      /Nghe[:\s]*(\d+\.?\d*)/i
    ],
    reading: [
      /Reading[:\s|]*(\d+\.?\d*)/i,
      /R[:\s|]*(\d+\.?\d*)/i,
      /Đọc[:\s]*(\d+\.?\d*)/i
    ],
    writing: [
      /Writing[:\s|]*(\d+\.?\d*)/i,
      /W[:\s|]*(\d+\.?\d*)/i,
      /Viết[:\s]*(\d+\.?\d*)/i
    ],
    speaking: [
      /Speaking[:\s|]*(\d+\.?\d*)/i,
      /S[:\s|]*(\d+\.?\d*)/i,
      /Nói[:\s]*(\d+\.?\d*)/i
    ]
  };
  
  for (const [skill, patterns] of Object.entries(skillPatterns)) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 100) { // Accept both scales
          data.scores[skill as keyof typeof data.scores] = convertScore(score);
          console.log(`🎯 ${skill}:`, match[0], '→', data.scores[skill as keyof typeof data.scores]);
          break;
        }
      }
    }
  }
  
  // Overall Band Score với nhiều pattern
  const overallPatterns = [
    /Overall\s+Band\s+Score[:\s]*(\d+\.?\d*)/i,
    /Band\s+Score[:\s]*(\d+\.?\d*)/i,
    /Band[:\s]*(\d+\.?\d*)/i,
    /Overall[:\s]*(\d+\.?\d*)/i,
    /Total[:\s]*(\d+\.?\d*)/i,
    /Tổng[:\s]*(\d+\.?\d*)/i
  ];
  
  for (const pattern of overallPatterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseFloat(match[1]);
      if (score >= 0 && score <= 100) {
        data.scores.overall = convertScore(score);
        console.log('🎯 Overall:', match[0], '→', data.scores.overall);
        break;
      }
    }
  }

  // TOEIC scores (0-990)
  const toeicMatch = text.match(/(?:Total\s+Score|Score)[:\s]+(\d{3,4})/i);
  if (toeicMatch && data.certificateType === 'TOEIC') {
    data.scores.overall = parseInt(toeicMatch[1]);
  }

  console.log('📋 Parsed data:', data);
  return data;
}

// Helper functions
function validateName(name: string): boolean {
  if (!name || name.length < 3) return false;
  
  const words = name.split(/\s+/).filter(word => word.length > 0);
  
  // Check word count (1-5 words is reasonable)
  if (words.length < 1 || words.length > 5) return false;
  
  // Check if all words are reasonable length
  if (!words.every(word => word.length >= 2 && word.length <= 20)) return false;
  
  // Check if contains only letters and spaces
  if (!/^[A-Za-zÀ-ỹ\s]+$/.test(name)) return false;
  
  // Check if properly capitalized
  if (!words.every(word => /^[A-ZÀ-Ỹ][a-zà-ỹ]*$/.test(word))) return false;
  
  return true;
}

function validateCertNumber(certNum: string): boolean {
  if (!certNum || certNum.length < 4 || certNum.length > 25) return false;
  
  // Should contain alphanumeric characters
  if (!/^[A-Z0-9\-]+$/i.test(certNum)) return false;
  
  // Should not be all numbers or all letters
  const hasNumbers = /\d/.test(certNum);
  const hasLetters = /[A-Z]/i.test(certNum);
  
  return hasNumbers || hasLetters; // At least one type
}

/**
 * Xử lý đầy đủ: OCR + Parse với tự động phát hiện chất lượng ảnh
 */
export async function processImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<Partial<ExtractedData>> {
  try {
    // Bước 1: Phân tích chất lượng ảnh
    onProgress?.({ status: 'Đang phân tích chất lượng ảnh...', progress: 0.05 });
    
    const imageAnalysis = await analyzeImageQuality(imageFile);
    
    // Bước 2: Quyết định phương pháp xử lý
    if (imageAnalysis.shouldUseEnhancement) {
      console.log('🔧 Sử dụng OCR nâng cao cho ảnh chất lượng thấp/trung bình');
      onProgress?.({ status: 'Chuyển sang OCR nâng cao...', progress: 0.1 });
      
      // Sử dụng hệ thống OCR nâng cao
      const enhancedResult = await processLowResolutionImage(imageFile, onProgress);
      
      // Convert sang format cũ để tương thích
      return {
        fullName: enhancedResult.fullName,
        dateOfBirth: enhancedResult.dateOfBirth,
        certificateNumber: enhancedResult.certificateNumber,
        examDate: enhancedResult.examDate,
        issueDate: enhancedResult.issueDate,
        scores: enhancedResult.scores,
        certificateType: enhancedResult.certificateType,
        rawText: enhancedResult.rawText,
        imageQuality: enhancedResult.imageQuality,
        enhancementApplied: enhancedResult.enhancementApplied,
        confidence: enhancedResult.confidence
      };
    } else {
      console.log('📝 Thử OCR tiêu chuẩn cho ảnh chất lượng cao');
      
      // Bước 3: OCR tiêu chuẩn
      const extractedText = await extractTextFromImage(imageFile, (progress) => {
        onProgress?.({
          ...progress,
          progress: 0.1 + progress.progress * 0.6
        });
      });
      
      // Bước 4: Parse
      const parsedData = parseExtractedText(extractedText);
      
      // Bước 5: Kiểm tra kết quả - nếu không tốt thì fallback sang enhanced OCR
      const standardConfidence = calculateStandardConfidence(parsedData);
      
      console.log('📊 Standard OCR result:', {
        confidence: standardConfidence,
        extractedFields: Object.keys(parsedData).filter(key => parsedData[key as keyof typeof parsedData] && key !== 'rawText'),
        rawTextLength: extractedText.length,
        rawTextPreview: extractedText.substring(0, 300) + '...'
      });
      
      if (standardConfidence < 40) {
        console.log('⚠️ OCR tiêu chuẩn không hiệu quả, chuyển sang OCR nâng cao...');
        console.log('📝 Raw text from standard OCR:', extractedText);
        onProgress?.({ status: 'Chuyển sang OCR nâng cao để cải thiện kết quả...', progress: 0.7 });
        
        // Fallback to enhanced OCR
        const enhancedResult = await processLowResolutionImage(imageFile, (progress) => {
          onProgress?.({
            ...progress,
            progress: 0.7 + progress.progress * 0.3
          });
        });
        
        return {
          fullName: enhancedResult.fullName,
          dateOfBirth: enhancedResult.dateOfBirth,
          certificateNumber: enhancedResult.certificateNumber,
          examDate: enhancedResult.examDate,
          issueDate: enhancedResult.issueDate,
          scores: enhancedResult.scores,
          certificateType: enhancedResult.certificateType,
          rawText: enhancedResult.rawText,
          imageQuality: enhancedResult.imageQuality,
          enhancementApplied: [...(enhancedResult.enhancementApplied || []), 'Fallback from Standard OCR'],
          confidence: enhancedResult.confidence
        };
      }
      
      // Thêm thông tin chất lượng ảnh
      return {
        ...parsedData,
        imageQuality: imageAnalysis.quality,
        enhancementApplied: ['Standard OCR'],
        confidence: standardConfidence
      };
    }
  } catch (error) {
    console.error('❌ Process Image Error:', error);
    
    // Last resort: Try enhanced OCR even on error
    console.log('🆘 Lỗi xử lý, thử OCR nâng cao như phương án cuối...');
    try {
      onProgress?.({ status: 'Thử phương án OCR nâng cao...', progress: 0.8 });
      const enhancedResult = await processLowResolutionImage(imageFile, onProgress);
      
      return {
        fullName: enhancedResult.fullName,
        dateOfBirth: enhancedResult.dateOfBirth,
        certificateNumber: enhancedResult.certificateNumber,
        examDate: enhancedResult.examDate,
        issueDate: enhancedResult.issueDate,
        scores: enhancedResult.scores,
        certificateType: enhancedResult.certificateType,
        rawText: enhancedResult.rawText,
        imageQuality: enhancedResult.imageQuality,
        enhancementApplied: [...(enhancedResult.enhancementApplied || []), 'Emergency Fallback'],
        confidence: enhancedResult.confidence
      };
    } catch (fallbackError) {
      console.error('❌ Enhanced OCR fallback also failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

/**
 * Tính confidence cho OCR tiêu chuẩn
 */
function calculateStandardConfidence(data: Partial<ExtractedData>): number {
  let score = 0;
  let maxScore = 0;
  
  // Tên (25 điểm)
  maxScore += 25;
  if (data.fullName && data.fullName.length >= 5) {
    const words = data.fullName.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      score += 25;
    } else {
      score += 15;
    }
  }
  
  // Loại chứng chỉ (20 điểm)
  maxScore += 20;
  if (data.certificateType && ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP'].includes(data.certificateType)) {
    score += 20;
  } else if (data.certificateType) {
    score += 10;
  }
  
  // Số chứng chỉ (20 điểm)
  maxScore += 20;
  if (data.certificateNumber && data.certificateNumber.length >= 6) {
    score += 20;
  } else if (data.certificateNumber) {
    score += 10;
  }
  
  // Ngày thi (15 điểm)
  maxScore += 15;
  if (data.examDate) {
    score += 15;
  }
  
  // Điểm số (20 điểm)
  maxScore += 20;
  if (data.scores) {
    const scoreCount = Object.keys(data.scores).length;
    if (scoreCount >= 4) {
      score += 20;
    } else if (scoreCount >= 2) {
      score += 15;
    } else if (scoreCount >= 1) {
      score += 10;
    }
  }
  
  return Math.round((score / maxScore) * 100);
}
