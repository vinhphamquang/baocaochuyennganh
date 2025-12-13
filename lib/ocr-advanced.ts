import Tesseract from 'tesseract.js';

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
  confidence: number;
}

/**
 * Tiền xử lý ảnh để cải thiện OCR
 */
async function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size với scale up để cải thiện OCR
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // Enable image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply advanced image enhancements
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast and brightness
        const contrast = 1.8;
        const brightness = 20;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        let enhancedGray = factor * (gray - 128) + 128 + brightness;
        
        // Clamp values
        enhancedGray = Math.max(0, Math.min(255, enhancedGray));
        
        // Apply adaptive threshold
        const threshold = enhancedGray > 140 ? 255 : 0;
        
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
 * Làm sạch và chuẩn hóa text OCR
 */
function cleanOCRText(text: string): string {
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Fix common OCR mistakes
    .replace(/[|]/g, 'I')
    .replace(/[0O]/g, 'O')
    .replace(/[5S]/g, 'S')
    .replace(/[1Il]/g, 'I')
    // Normalize punctuation
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    // Remove noise characters
    .replace(/[^\w\s.,:/\-()]/g, ' ')
    .trim();
}

/**
 * Trích xuất thông tin dựa trên context và vị trí
 */
function extractByContext(text: string, keywords: string[], patterns: RegExp[]): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Tìm dòng chứa keyword
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hasKeyword = keywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      // Thử extract từ dòng hiện tại
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match && match[1]) return match[1].trim();
      }
      
      // Thử extract từ dòng tiếp theo
      if (i + 1 < lines.length) {
        for (const pattern of patterns) {
          const match = lines[i + 1].match(pattern);
          if (match && match[1]) return match[1].trim();
        }
      }
      
      // Thử extract từ phần còn lại của dòng hiện tại
      const afterKeyword = line.substring(line.toLowerCase().indexOf(keywords[0].toLowerCase()) + keywords[0].length);
      const simpleMatch = afterKeyword.match(/[:\s]*([A-Z0-9][A-Za-z0-9\s\-./]{2,})/);
      if (simpleMatch) return simpleMatch[1].trim();
    }
  }
  
  return null;
}

/**
 * Trích xuất điểm số với AI logic
 */
function extractScores(text: string, certificateType: string): any {
  const scores: any = {};
  
  if (certificateType === 'IELTS') {
    // IELTS specific patterns
    const skillPatterns = {
      listening: [
        /Listening[:\s]*(\d+\.?\d*)/i,
        /L[:\s]*(\d+\.?\d*)/i,
        /Nghe[:\s]*(\d+\.?\d*)/i
      ],
      reading: [
        /Reading[:\s]*(\d+\.?\d*)/i,
        /R[:\s]*(\d+\.?\d*)/i,
        /Đọc[:\s]*(\d+\.?\d*)/i
      ],
      writing: [
        /Writing[:\s]*(\d+\.?\d*)/i,
        /W[:\s]*(\d+\.?\d*)/i,
        /Viết[:\s]*(\d+\.?\d*)/i
      ],
      speaking: [
        /Speaking[:\s]*(\d+\.?\d*)/i,
        /S[:\s]*(\d+\.?\d*)/i,
        /Nói[:\s]*(\d+\.?\d*)/i
      ]
    };
    
    // Extract individual skills
    for (const [skill, patterns] of Object.entries(skillPatterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const score = parseFloat(match[1]);
          if (score >= 0 && score <= 9) {
            scores[skill] = score;
            console.log(`✅ ${skill}: ${score}`);
            break;
          }
        }
      }
    }
    
    // Extract overall band score
    const overallPatterns = [
      /Overall Band Score[:\s]*(\d+\.?\d*)/i,
      /Band[:\s]*(\d+\.?\d*)/i,
      /Overall[:\s]*(\d+\.?\d*)/i,
      /Tổng[:\s]*(\d+\.?\d*)/i
    ];
    
    for (const pattern of overallPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 9) {
          scores.overall = score;
          console.log(`✅ Overall: ${score}`);
          break;
        }
      }
    }
  }
  
  else if (certificateType === 'TOEIC') {
    // TOEIC specific patterns (0-990)
    const toeicPatterns = [
      /Total Score[:\s]*(\d{3,4})/i,
      /Score[:\s]*(\d{3,4})/i,
      /Listening[:\s]*(\d{2,3})/i,
      /Reading[:\s]*(\d{2,3})/i
    ];
    
    for (const pattern of toeicPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= 10 && score <= 990) {
          scores.overall = score;
          console.log(`✅ TOEIC Score: ${score}`);
          break;
        }
      }
    }
  }
  
  return scores;
}

/**
 * Phân tích văn bản và trích xuất thông tin chứng chỉ - AI Enhanced
 */
export function parseExtractedText(text: string): Partial<ExtractedData> {
  console.log('🔍 Raw OCR Text:', text);
  
  // Clean text
  const cleanText = cleanOCRText(text);
  console.log('🧹 Cleaned Text:', cleanText);
  
  const data: Partial<ExtractedData> & { confidence: number } = {
    rawText: text,
    confidence: 0
  };

  // Xác định loại chứng chỉ với độ chính xác cao
  const certTypePatterns = [
    { type: 'IELTS', patterns: [/IELTS/i, /International English Language Testing System/i], weight: 10 },
    { type: 'TOEFL', patterns: [/TOEFL/i, /Test of English as a Foreign Language/i], weight: 10 },
    { type: 'TOEIC', patterns: [/TOEIC/i, /Test of English for International Communication/i], weight: 10 },
    { type: 'VSTEP', patterns: [/VSTEP/i, /Vietnamese Standardized Test/i], weight: 8 },
    { type: 'HSK', patterns: [/HSK/i, /Hanyu Shuiping Kaoshi/i], weight: 8 },
    { type: 'JLPT', patterns: [/JLPT/i, /Japanese Language Proficiency Test/i], weight: 8 }
  ];

  let maxWeight = 0;
  for (const { type, patterns, weight } of certTypePatterns) {
    if (patterns.some(pattern => cleanText.match(pattern)) && weight > maxWeight) {
      data.certificateType = type;
      maxWeight = weight;
      data.confidence += 20;
    }
  }

  // Trích xuất tên với nhiều phương pháp
  const nameKeywords = ['name', 'candidate', 'họ và tên', 'family name', 'first name'];
  const namePatterns = [
    /(?:Candidate\s+)?Name[:\s]*([A-Z][A-Za-z\s]{5,40})/i,
    /Family\s+Name[:\s]*([A-Z]+)\s+First\s+Name[:\s]*([A-Z\s]+)/i,
    /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)/,
    /Họ\s+và\s+tên[:\s]*([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{5,40})/i
  ];

  // Try context-based extraction first
  const contextName = extractByContext(cleanText, nameKeywords, namePatterns);
  if (contextName && contextName.length >= 5) {
    data.fullName = contextName;
    data.confidence += 25;
    console.log('✅ Name (context):', contextName);
  } else {
    // Fallback to pattern matching
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        if (pattern.source.includes('Family') && match[1] && match[2]) {
          data.fullName = `${match[2].trim()} ${match[1].trim()}`;
        } else if (match[1]) {
          data.fullName = match[1].trim();
        }
        if (data.fullName && data.fullName.length >= 5) {
          data.confidence += 20;
          console.log('✅ Name (pattern):', data.fullName);
          break;
        }
      }
    }
  }

  // Trích xuất ngày sinh
  const dobKeywords = ['date of birth', 'dob', 'ngày sinh'];
  const dobPatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
    /(\d{1,2}\s+[A-Z]{3}\s+\d{4})/gi
  ];
  
  const dobResult = extractByContext(cleanText, dobKeywords, dobPatterns);
  if (dobResult) {
    data.dateOfBirth = dobResult;
    data.confidence += 15;
    console.log('✅ Date of Birth:', dobResult);
  }

  // Trích xuất số chứng chỉ
  const certNumKeywords = ['form number', 'certificate number', 'candidate number', 'số chứng chỉ'];
  const certNumPatterns = [
    /([A-Z0-9]{8,20})/g,
    /(\d{10,15})/g
  ];
  
  const certNum = extractByContext(cleanText, certNumKeywords, certNumPatterns);
  if (certNum) {
    data.certificateNumber = certNum;
    data.confidence += 15;
    console.log('✅ Certificate Number:', certNum);
  }

  // Trích xuất ngày thi
  const examDateKeywords = ['date', 'test date', 'exam date', 'ngày thi'];
  const examDatePatterns = dobPatterns;
  
  const examDate = extractByContext(cleanText, examDateKeywords, examDatePatterns);
  if (examDate && examDate !== data.dateOfBirth) {
    data.examDate = examDate;
    data.confidence += 10;
    console.log('✅ Exam Date:', examDate);
  }

  // Trích xuất điểm số với AI
  if (data.certificateType) {
    data.scores = extractScores(cleanText, data.certificateType);
    const scoreCount = Object.keys(data.scores || {}).length;
    data.confidence += scoreCount * 5;
  }

  console.log(`📊 Final confidence: ${data.confidence}%`);
  console.log('📋 Extracted data:', data);
  
  return data;
}

/**
 * Trích xuất văn bản từ ảnh với OCR nâng cao
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

    // Clean up blob URL
    URL.revokeObjectURL(processedImageUrl);
    
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Không thể đọc văn bản từ ảnh');
  }
}

/**
 * Xử lý đầy đủ: OCR + Parse với AI
 */
export async function processImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<Partial<ExtractedData>> {
  // Bước 1: OCR nâng cao
  const extractedText = await extractTextFromImage(imageFile, onProgress);
  
  // Bước 2: Parse với AI
  const parsedData = parseExtractedText(extractedText);
  
  return parsedData;
}

/**
 * Test function với mock OCR text
 */
export function testOCRParsing() {
  const mockText = `
    IELTS Test Report Form
    Candidate Name: NGUYEN VAN A
    Date of Birth: 15/03/1995
    Form Number: IELTS2023ABC123
    Date: 12/10/2023
    
    Listening: 8.0
    Reading: 7.0
    Writing: 7.0
    Speaking: 8.0
    Overall Band Score: 7.5
  `;
  
  console.log('🧪 Testing OCR parsing with mock data...');
  const result = parseExtractedText(mockText);
  console.log('✅ Test result:', result);
  return result;
}