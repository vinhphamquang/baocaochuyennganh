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
 * Trích xuất văn bản từ ảnh sử dụng Tesseract.js OCR
 */
export async function extractTextFromImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      imageFile,
      'eng+vie', // Hỗ trợ cả tiếng Anh và tiếng Việt
      {
        logger: (m) => {
          if (onProgress) {
            onProgress({
              status: m.status,
              progress: m.progress || 0
            });
          }
        }
      }
    );

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
