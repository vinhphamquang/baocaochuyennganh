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
 * Phân tích văn bản và trích xuất thông tin chứng chỉ
 */
export function parseExtractedText(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {
    rawText: text
  };

  // Xác định loại chứng chỉ
  const certTypes = ['IELTS', 'TOEIC', 'TOEFL', 'VSTEP'];
  for (const type of certTypes) {
    if (text.toUpperCase().includes(type)) {
      data.certificateType = type;
      break;
    }
  }

  // Trích xuất tên (Family Name + First Name cho IELTS)
  const familyNameMatch = text.match(/Family\s+Name\s+([A-Z]+)(?:\s|$)/i);
  const firstNameMatch = text.match(/First\s+Name\(?s?\)?\s+([A-Z][A-Z\s]+?)(?:\s+\||Candidate|Date|\n)/i);
  
  console.log('🔍 Family Name Match:', familyNameMatch);
  console.log('🔍 First Name Match:', firstNameMatch);
  
  if (familyNameMatch && firstNameMatch) {
    const firstName = firstNameMatch[1].trim();
    const familyName = familyNameMatch[1].trim();
    data.fullName = `${firstName} ${familyName}`;
    console.log('✅ Full Name:', data.fullName);
  } else {
    // Fallback patterns
    const namePatterns = [
      /(?:Full\s+)?Name[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|Date|DOB|Certificate)/i,
      /Candidate[:\s]+([A-Z][A-Za-z\s]+?)(?:\n|Date|DOB)/i,
      /Họ\s+và\s+tên[:\s]+([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]+?)(?:\n|Ngày)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.fullName = match[1].trim();
        break;
      }
    }
  }

  // Trích xuất ngày sinh (DD/MM/YYYY hoặc DD-MM-YYYY)
  const dobPatterns = [
    /Date\s+of\s+Birth[:\s|]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /DOB[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Ngày\s+sinh[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.dateOfBirth = match[1];
      break;
    }
  }

  // Trích xuất số chứng chỉ (Form Number cho IELTS)
  const certNumPatterns = [
    /Form\s+Number\s+([A-Z0-9]+)/i,
    /Candidate\s+Number[:\s|]+(\d+)/i,
    /(?:Certificate\s+(?:Number|No)|Registration\s+(?:Number|No))[:\s]+([A-Z0-9\-]+)/i,
    /(?:Số\s+chứng\s+chỉ)[:\s]+([A-Z0-9\-]+)/i,
    /\b(\d{2}[A-Z]{2}\d{6}[A-Z0-9]+)\b/
  ];
  
  for (const pattern of certNumPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.certificateNumber = match[1];
      break;
    }
  }

  // Trích xuất ngày thi (Date field hoặc Test Report Date)
  const examDatePatterns = [
    /Date[:\s|]+(\d{1,2}[\/\-][A-Z]{3}[\/\-]\d{4})/i, // 15/APR/2023
    /Date[:\s|]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Test\s+Report\s+Date[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /(?:Test\s+Date|Exam\s+Date|Ngày\s+thi)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of examDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.examDate = match[1];
      break;
    }
  }

  // Trích xuất ngày cấp
  const issueDatePatterns = [
    /(?:Issue\s+Date|Date\s+of\s+Issue|Ngày\s+cấp)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  for (const pattern of issueDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.issueDate = match[1];
      break;
    }
  }

  // Trích xuất điểm số
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
  
  // IELTS scores - xử lý các ký tự đặc biệt: |"50-| hoặc |° 60 hoặc "60" hoặc |. 50
  const listeningMatch = text.match(/Listening[:\s|]+["\s°\.\-]*(\d+)\.?\d*/i);
  if (listeningMatch) {
    const score = parseFloat(listeningMatch[1]);
    data.scores.listening = convertScore(score);
    console.log('🎯 Listening:', listeningMatch[0], '→', data.scores.listening);
  }
  
  const readingMatch = text.match(/Reading[:\s|]+["\s°\.\-]*(\d+)\.?\d*/i);
  if (readingMatch) {
    const score = parseFloat(readingMatch[1]);
    data.scores.reading = convertScore(score);
    console.log('🎯 Reading:', readingMatch[0], '→', data.scores.reading);
  }
  
  const writingMatch = text.match(/Writing[:\s|]+["\s°\.\-]*(\d+)\.?\d*/i);
  if (writingMatch) {
    const score = parseFloat(writingMatch[1]);
    data.scores.writing = convertScore(score);
    console.log('🎯 Writing:', writingMatch[0], '→', data.scores.writing);
  }
  
  const speakingMatch = text.match(/Speaking[:\s|]+["\s°\.\-]*(\d+)\.?\d*/i);
  if (speakingMatch) {
    const score = parseFloat(speakingMatch[1]);
    data.scores.speaking = convertScore(score);
    console.log('🎯 Speaking:', speakingMatch[0], '→', data.scores.speaking);
  }
  
  // Overall Band Score - "Band 55" là overall score thật, bỏ qua "Overall | 0z"
  const bandMatch = text.match(/Band\s+(\d+)\.?\d*/i);
  if (bandMatch) {
    const score = parseFloat(bandMatch[1]);
    data.scores.overall = convertScore(score);
    console.log('🎯 Overall (Band):', bandMatch[0], '→', data.scores.overall);
  } else {
    // Fallback: Overall
    const overallMatch = text.match(/Overall[:\s|]+(\d+)\.?\d*/i);
    if (overallMatch) {
      const score = parseFloat(overallMatch[1]);
      data.scores.overall = convertScore(score);
      console.log('🎯 Overall:', overallMatch[0], '→', data.scores.overall);
    }
  }

  // TOEIC scores (0-990)
  const toeicMatch = text.match(/(?:Total\s+Score|Score)[:\s]+(\d{3,4})/i);
  if (toeicMatch && data.certificateType === 'TOEIC') {
    data.scores.overall = parseInt(toeicMatch[1]);
  }

  return data;
}

/**
 * Xử lý đầy đủ: OCR + Parse
 */
export async function processImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<Partial<ExtractedData>> {
  // Bước 1: OCR
  const extractedText = await extractTextFromImage(imageFile, onProgress);
  
  // Bước 2: Parse
  const parsedData = parseExtractedText(extractedText);
  
  return parsedData;
}
