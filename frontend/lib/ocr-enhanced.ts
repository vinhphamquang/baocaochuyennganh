import Tesseract from 'tesseract.js';

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
 * Enhanced OCR với multiple strategies
 */
export async function enhancedOCR(imageFile: File): Promise<Partial<ExtractedData>> {
  console.log('🚀 Starting Enhanced OCR...');
  
  try {
    // Strategy 1: Standard OCR
    const standardResult = await standardOCR(imageFile);
    console.log('📝 Standard OCR confidence:', standardResult.confidence);
    
    // Strategy 2: Enhanced preprocessing OCR
    const enhancedResult = await preprocessedOCR(imageFile);
    console.log('🔧 Enhanced OCR confidence:', enhancedResult.confidence);
    
    // Strategy 3: Multi-language OCR
    const multiLangResult = await multiLanguageOCR(imageFile);
    console.log('🌐 Multi-lang OCR confidence:', multiLangResult.confidence);
    
    // Combine results
    const bestResult = selectBestResult([standardResult, enhancedResult, multiLangResult]);
    console.log('✅ Best result selected with confidence:', bestResult.confidence);
    
    return bestResult;
  } catch (error) {
    console.error('❌ Enhanced OCR Error:', error);
    throw error;
  }
}

/**
 * Standard OCR
 */
async function standardOCR(imageFile: File): Promise<Partial<ExtractedData>> {
  const result = await Tesseract.recognize(imageFile, 'eng+vie');
  const parsed = parseText(result.data.text);
  
  return {
    ...parsed,
    confidence: result.data.confidence * 0.8, // Slightly lower confidence for standard
    rawText: result.data.text
  };
}

/**
 * OCR với preprocessing nâng cao
 */
async function preprocessedOCR(imageFile: File): Promise<Partial<ExtractedData>> {
  // Preprocess image
  const processedImage = await preprocessImage(imageFile);
  
  const result = await Tesseract.recognize(processedImage, 'eng+vie');
  
  const parsed = parseText(result.data.text);
  
  return {
    ...parsed,
    confidence: result.data.confidence * 0.9,
    rawText: result.data.text
  };
}

/**
 * Multi-language OCR
 */
async function multiLanguageOCR(imageFile: File): Promise<Partial<ExtractedData>> {
  const result = await Tesseract.recognize(imageFile, 'eng+vie+chi_sim');
  
  const parsed = parseText(result.data.text);
  
  return {
    ...parsed,
    confidence: result.data.confidence * 0.85,
    rawText: result.data.text
  };
}

/**
 * Preprocess image for better OCR
 */
async function preprocessImage(imageFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // Scale up for better recognition
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const enhancedGray = factor * (gray - 128) + 128;
        
        // Apply threshold
        const threshold = enhancedGray > 140 ? 255 : 0;
        
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }
      
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
 * Enhanced text parsing với multiple patterns
 */
function parseText(text: string): Partial<ExtractedData> {
  console.log('🔍 Parsing text:', text.substring(0, 200) + '...');
  
  const data: Partial<ExtractedData> = {};
  
  // Detect certificate type với improved patterns
  data.certificateType = detectCertificateType(text);
  
  // Extract name với multiple strategies
  data.fullName = extractName(text);
  
  // Extract certificate number
  data.certificateNumber = extractCertificateNumber(text, data.certificateType);
  
  // Extract dates
  const dates = extractDates(text);
  data.dateOfBirth = dates.dateOfBirth;
  data.examDate = dates.examDate;
  data.issueDate = dates.issueDate;
  
  // Extract scores
  data.scores = extractScores(text, data.certificateType);
  
  return data;
}

/**
 * Improved certificate type detection
 */
function detectCertificateType(text: string): string {
  const upperText = text.toUpperCase();
  
  const patterns = [
    { type: 'IELTS', keywords: ['IELTS', 'INTERNATIONAL ENGLISH LANGUAGE', 'TEST REPORT FORM', 'BAND SCORE'] },
    { type: 'TOEFL', keywords: ['TOEFL', 'TEST OF ENGLISH AS A FOREIGN LANGUAGE', 'ETS', 'IBT'] },
    { type: 'TOEIC', keywords: ['TOEIC', 'TEST OF ENGLISH FOR INTERNATIONAL COMMUNICATION', 'LISTENING AND READING'] },
    { type: 'VSTEP', keywords: ['VSTEP', 'VIETNAMESE STANDARDIZED TEST', 'BỘ GIÁO DỤC'] },
    { type: 'HSK', keywords: ['HSK', 'HANYU SHUIPING KAOSHI', 'CHINESE PROFICIENCY'] },
    { type: 'JLPT', keywords: ['JLPT', 'JAPANESE LANGUAGE PROFICIENCY', 'NIHONGO'] }
  ];
  
  for (const { type, keywords } of patterns) {
    const matchCount = keywords.filter(keyword => upperText.includes(keyword)).length;
    if (matchCount >= 1) {
      console.log(`🎯 Certificate type detected: ${type} (${matchCount} matches)`);
      return type;
    }
  }
  
  return '';
}

/**
 * Enhanced name extraction
 */
function extractName(text: string): string {
  const patterns = [
    // IELTS format: Family Name: XXX First Name: YYY
    /Family\s+Name[:\s]*([A-Z]+)\s+First\s+Name[:\s]*([A-Z\s]+)/i,
    
    // Standard format: Name: XXX YYY
    /(?:Candidate\s+)?Name[:\s]*([A-Z][A-Za-z\s]{5,50})/i,
    
    // Vietnamese format
    /Họ\s+và\s+tên[:\s]*([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{5,50})/i,
    
    // Context-based: Name before Date/DOB
    /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s+(?:Date|DOB|Birth)/i,
    
    // All caps names (2-4 words)
    /\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?(?:\s+[A-Z]{2,})?)\b/g
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let name = '';
      
      // Handle IELTS Family + First name format
      if (pattern.source.includes('Family') && match[1] && match[2]) {
        name = `${match[2].trim()} ${match[1].trim()}`;
      } else if (match[1]) {
        name = match[1].trim();
      }
      
      // Validate name
      if (validateName(name)) {
        console.log(`✅ Name extracted: ${name}`);
        return name;
      }
    }
  }
  
  return '';
}

/**
 * Enhanced certificate number extraction
 */
function extractCertificateNumber(text: string, certificateType?: string): string {
  const patterns = [
    // IELTS Test Report Form Number
    /(?:Test\s+Report\s+Form|Form)\s+Number[:\s]*([A-Z0-9]{6,20})/i,
    
    // Registration Number
    /Registration\s+Number[:\s]*([A-Z0-9\-]{6,20})/i,
    
    // Certificate Number
    /Certificate\s+Number[:\s]*([A-Z0-9\-]{6,20})/i,
    
    // Candidate Number
    /Candidate\s+Number[:\s]*(\d{6,15})/i,
    
    // Pattern-based
    /\b([A-Z]{2,4}\d{6,12}[A-Z0-9]*)\b/,
    /\b(\d{2}[A-Z]{2}\d{6}[A-Z0-9]+)\b/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const certNum = match[1].trim();
      if (certNum.length >= 6 && certNum.length <= 25) {
        console.log(`✅ Certificate number extracted: ${certNum}`);
        return certNum;
      }
    }
  }
  
  return '';
}

/**
 * Enhanced date extraction
 */
function extractDates(text: string): { dateOfBirth?: string; examDate?: string; issueDate?: string } {
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g;
  const dates = text.match(datePattern) || [];
  
  const result: { dateOfBirth?: string; examDate?: string; issueDate?: string } = {};
  
  // Context-based date assignment
  const dobPatterns = [
    /Date\s+of\s+Birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /DOB[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  const examDatePatterns = [
    /Test\s+Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Exam\s+Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    /Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
  ];
  
  // Extract specific dates
  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.dateOfBirth = match[1];
      break;
    }
  }
  
  for (const pattern of examDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.examDate = match[1];
      break;
    }
  }
  
  // If no specific dates found, use first available dates
  if (!result.examDate && dates.length > 0) {
    result.examDate = dates[0];
  }
  
  if (!result.issueDate && dates.length > 1) {
    result.issueDate = dates[1];
  }
  
  return result;
}

/**
 * Enhanced score extraction
 */
function extractScores(text: string, certificateType?: string): any {
  const scores: any = {};
  
  if (certificateType === 'IELTS') {
    // IELTS scores (0-9)
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
            console.log(`🎯 IELTS ${skill}: ${score}`);
            break;
          }
        }
      }
    }
    
    // Overall Band Score
    const overallPatterns = [
      /Overall\s+Band\s+Score[:\s]*(\d+\.?\d*)/i,
      /Band[:\s]*(\d+\.?\d*)/i,
      /Overall[:\s]*(\d+\.?\d*)/i
    ];
    
    for (const pattern of overallPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 9) {
          scores.overall = score;
          console.log(`🎯 IELTS Overall: ${score}`);
          break;
        }
      }
    }
  }
  
  // Add other certificate types...
  
  return scores;
}

/**
 * Validate name quality
 */
function validateName(name: string): boolean {
  if (!name || name.length < 3) return false;
  
  const words = name.split(/\s+/).filter(word => word.length > 0);
  
  // Check word count (2-4 words is reasonable)
  if (words.length < 2 || words.length > 4) return false;
  
  // Check if all words are reasonable length
  if (!words.every(word => word.length >= 2 && word.length <= 20)) return false;
  
  // Check if contains only letters and spaces
  if (!/^[A-Za-zÀ-ỹ\s]+$/.test(name)) return false;
  
  return true;
}

/**
 * Select best result from multiple OCR attempts
 */
function selectBestResult(results: Array<Partial<ExtractedData>>): Partial<ExtractedData> {
  // Sort by confidence
  results.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  
  const best = results[0];
  
  // Merge information from other results if main result is missing data
  for (let i = 1; i < results.length; i++) {
    const current = results[i];
    
    if (!best.fullName && current.fullName) best.fullName = current.fullName;
    if (!best.certificateNumber && current.certificateNumber) best.certificateNumber = current.certificateNumber;
    if (!best.certificateType && current.certificateType) best.certificateType = current.certificateType;
    if (!best.examDate && current.examDate) best.examDate = current.examDate;
    if (!best.dateOfBirth && current.dateOfBirth) best.dateOfBirth = current.dateOfBirth;
    
    // Merge scores
    if (current.scores) {
      best.scores = { ...best.scores, ...current.scores };
    }
  }
  
  return best;
}