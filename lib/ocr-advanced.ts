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
  issuingOrganization: string;
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
 * Tiền xử lý ảnh nâng cao với nhiều kỹ thuật AI
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
      
      // Tự động điều chỉnh scale dựa trên kích thước ảnh
      const optimalScale = calculateOptimalScale(img.width, img.height);
      canvas.width = img.width * optimalScale;
      canvas.height = img.height * optimalScale;
      
      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply multi-stage image enhancement
      applyAdvancedPreprocessing(data, canvas.width, canvas.height);
      
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
 * Tính toán scale tối ưu dựa trên kích thước ảnh
 */
function calculateOptimalScale(width: number, height: number): number {
  const targetWidth = 2400; // Target width for optimal OCR
  const targetHeight = 1800; // Target height for optimal OCR
  
  const scaleX = targetWidth / width;
  const scaleY = targetHeight / height;
  
  // Chọn scale nhỏ hơn để không làm ảnh quá lớn
  const scale = Math.min(scaleX, scaleY);
  
  // Giới hạn scale trong khoảng hợp lý
  return Math.max(1.5, Math.min(4, scale));
}

/**
 * Áp dụng xử lý ảnh nâng cao nhiều giai đoạn
 */
function applyAdvancedPreprocessing(data: Uint8ClampedArray, width: number, height: number) {
  // Stage 1: Noise reduction
  applyGaussianBlur(data, width, height, 0.8);
  
  // Stage 2: Contrast enhancement with adaptive histogram equalization
  applyAdaptiveHistogramEqualization(data, width, height);
  
  // Stage 3: Edge-preserving smoothing
  applyBilateralFilter(data, width, height);
  
  // Stage 4: Text-specific enhancement
  applyTextEnhancement(data, width, height);
  
  // Stage 5: Final adaptive thresholding
  applyAdaptiveThresholding(data, width, height);
}

/**
 * Gaussian blur để giảm noise
 */
function applyGaussianBlur(data: Uint8ClampedArray, width: number, height: number, sigma: number) {
  const kernel = generateGaussianKernel(sigma);
  const kernelSize = kernel.length;
  const radius = Math.floor(kernelSize / 2);
  const original = new Uint8ClampedArray(data);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - radius;
          const py = y + ky - radius;
          const idx = (py * width + px) * 4;
          const weight = kernel[ky] * kernel[kx];
          
          r += original[idx] * weight;
          g += original[idx + 1] * weight;
          b += original[idx + 2] * weight;
        }
      }
      
      const idx = (y * width + x) * 4;
      data[idx] = Math.round(r);
      data[idx + 1] = Math.round(g);
      data[idx + 2] = Math.round(b);
    }
  }
}

/**
 * Tạo Gaussian kernel
 */
function generateGaussianKernel(sigma: number): number[] {
  const size = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = new Array(size);
  const center = Math.floor(size / 2);
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const x = i - center;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  
  // Normalize
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
}

/**
 * Adaptive Histogram Equalization
 */
function applyAdaptiveHistogramEqualization(data: Uint8ClampedArray, width: number, height: number) {
  const tileSize = 64; // Size of each tile
  const clipLimit = 2.0; // Clip limit for contrast limiting
  
  for (let tileY = 0; tileY < height; tileY += tileSize) {
    for (let tileX = 0; tileX < width; tileX += tileSize) {
      const endX = Math.min(tileX + tileSize, width);
      const endY = Math.min(tileY + tileSize, height);
      
      // Calculate histogram for this tile
      const histogram = new Array(256).fill(0);
      let pixelCount = 0;
      
      for (let y = tileY; y < endY; y++) {
        for (let x = tileX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          histogram[gray]++;
          pixelCount++;
        }
      }
      
      // Apply contrast limiting
      const clipValue = Math.floor(clipLimit * pixelCount / 256);
      let excess = 0;
      
      for (let i = 0; i < 256; i++) {
        if (histogram[i] > clipValue) {
          excess += histogram[i] - clipValue;
          histogram[i] = clipValue;
        }
      }
      
      // Redistribute excess
      const redistribution = Math.floor(excess / 256);
      for (let i = 0; i < 256; i++) {
        histogram[i] += redistribution;
      }
      
      // Calculate cumulative distribution
      const cdf = new Array(256);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }
      
      // Apply equalization to tile
      for (let y = tileY; y < endY; y++) {
        for (let x = tileX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          const newGray = Math.round((cdf[gray] / pixelCount) * 255);
          
          data[idx] = newGray;
          data[idx + 1] = newGray;
          data[idx + 2] = newGray;
        }
      }
    }
  }
}

/**
 * Bilateral filter để làm mịn nhưng giữ nguyên edges
 */
function applyBilateralFilter(data: Uint8ClampedArray, width: number, height: number) {
  const radius = 3;
  const sigmaSpace = 50;
  const sigmaColor = 50;
  const original = new Uint8ClampedArray(data);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let weightSum = 0;
      let r = 0, g = 0, b = 0;
      
      const centerIdx = (y * width + x) * 4;
      const centerR = original[centerIdx];
      const centerG = original[centerIdx + 1];
      const centerB = original[centerIdx + 2];
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          const idx = (ny * width + nx) * 4;
          
          // Spatial weight
          const spatialDist = dx * dx + dy * dy;
          const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));
          
          // Color weight
          const colorDist = Math.pow(original[idx] - centerR, 2) + 
                           Math.pow(original[idx + 1] - centerG, 2) + 
                           Math.pow(original[idx + 2] - centerB, 2);
          const colorWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));
          
          const weight = spatialWeight * colorWeight;
          weightSum += weight;
          
          r += original[idx] * weight;
          g += original[idx + 1] * weight;
          b += original[idx + 2] * weight;
        }
      }
      
      data[centerIdx] = Math.round(r / weightSum);
      data[centerIdx + 1] = Math.round(g / weightSum);
      data[centerIdx + 2] = Math.round(b / weightSum);
    }
  }
}

/**
 * Text-specific enhancement
 */
function applyTextEnhancement(data: Uint8ClampedArray, width: number, height: number) {
  const original = new Uint8ClampedArray(data);
  
  // Unsharp masking for text sharpening
  const blurRadius = 1;
  const amount = 1.5;
  const threshold = 10;
  
  for (let y = blurRadius; y < height - blurRadius; y++) {
    for (let x = blurRadius; x < width - blurRadius; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate blurred value
      let blurR = 0, blurG = 0, blurB = 0, count = 0;
      
      for (let dy = -blurRadius; dy <= blurRadius; dy++) {
        for (let dx = -blurRadius; dx <= blurRadius; dx++) {
          const blurIdx = ((y + dy) * width + (x + dx)) * 4;
          blurR += original[blurIdx];
          blurG += original[blurIdx + 1];
          blurB += original[blurIdx + 2];
          count++;
        }
      }
      
      blurR /= count;
      blurG /= count;
      blurB /= count;
      
      // Apply unsharp mask
      const diffR = original[idx] - blurR;
      const diffG = original[idx + 1] - blurG;
      const diffB = original[idx + 2] - blurB;
      
      if (Math.abs(diffR) > threshold) {
        data[idx] = Math.max(0, Math.min(255, original[idx] + amount * diffR));
      }
      if (Math.abs(diffG) > threshold) {
        data[idx + 1] = Math.max(0, Math.min(255, original[idx + 1] + amount * diffG));
      }
      if (Math.abs(diffB) > threshold) {
        data[idx + 2] = Math.max(0, Math.min(255, original[idx + 2] + amount * diffB));
      }
    }
  }
}

/**
 * Adaptive thresholding với Otsu's method
 */
function applyAdaptiveThresholding(data: Uint8ClampedArray, width: number, height: number) {
  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  // Calculate optimal threshold using Otsu's method
  const histogram = new Array(256).fill(0);
  const totalPixels = width * height;
  
  // Build histogram
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }
  
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    
    wF = totalPixels - wB;
    if (wF === 0) break;
    
    sumB += t * histogram[t];
    
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const betweenVariance = wB * wF * (mB - mF) * (mB - mF);
    
    if (betweenVariance > maxVariance) {
      maxVariance = betweenVariance;
      threshold = t;
    }
  }
  
  // Apply adaptive threshold with local adjustments
  const blockSize = 16;
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      const endX = Math.min(x + blockSize, width);
      const endY = Math.min(y + blockSize, height);
      
      // Calculate local mean
      let localSum = 0;
      let localCount = 0;
      
      for (let ly = y; ly < endY; ly++) {
        for (let lx = x; lx < endX; lx++) {
          const idx = (ly * width + lx) * 4;
          localSum += data[idx];
          localCount++;
        }
      }
      
      const localMean = localSum / localCount;
      const localThreshold = Math.max(threshold * 0.7, Math.min(threshold * 1.3, localMean));
      
      // Apply threshold to block
      for (let ly = y; ly < endY; ly++) {
        for (let lx = x; lx < endX; lx++) {
          const idx = (ly * width + lx) * 4;
          const value = data[idx] > localThreshold ? 255 : 0;
          data[idx] = value;
          data[idx + 1] = value;
          data[idx + 2] = value;
        }
      }
    }
  }
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
 * Phân tích văn bản và trích xuất thông tin chứng chỉ - AI Enhanced với Machine Learning patterns
 */
export function parseExtractedText(text: string): Partial<ExtractedData> {
  console.log('🔍 Raw OCR Text:', text);
  
  // Clean text với advanced cleaning
  const cleanText = advancedTextCleaning(text);
  console.log('🧹 Cleaned Text:', cleanText);
  
  const data: Partial<ExtractedData> & { confidence: number } = {
    rawText: text,
    confidence: 0
  };

  // AI-powered certificate type detection với confidence scoring
  const certTypeResult = detectCertificateTypeWithConfidence(cleanText);
  data.certificateType = certTypeResult.type;
  data.confidence += certTypeResult.confidence;

  // Multi-strategy name extraction
  const nameResult = extractNameWithMultipleStrategies(cleanText);
  if (nameResult.name) {
    data.fullName = nameResult.name;
    data.confidence += nameResult.confidence;
  }

  // Context-aware date extraction
  const dateResults = extractDatesWithContext(cleanText);
  data.dateOfBirth = dateResults.dateOfBirth;
  data.examDate = dateResults.examDate;
  data.issueDate = dateResults.issueDate;
  data.confidence += dateResults.confidence;

  // Advanced certificate number extraction
  const certNumResult = extractCertificateNumberAdvanced(cleanText, data.certificateType);
  if (certNumResult.number) {
    data.certificateNumber = certNumResult.number;
    data.confidence += certNumResult.confidence;
  }

  // Intelligent score extraction với validation
  const scoresResult = extractScoresIntelligent(cleanText, data.certificateType);
  data.scores = scoresResult.scores;
  data.confidence += scoresResult.confidence;

  // Organization detection với context
  const orgResult = detectOrganizationWithContext(cleanText, data.certificateType);
  if (orgResult.organization) {
    data.issuingOrganization = orgResult.organization;
    data.confidence += orgResult.confidence;
  }

  // Final confidence calculation với weighted scoring
  data.confidence = calculateFinalConfidence(data);
  
  console.log(`📊 Final AI confidence: ${data.confidence}%`);
  console.log('📋 Extracted data:', data);
  
  return data;
}

/**
 * Advanced text cleaning với multiple techniques
 */
function advancedTextCleaning(text: string): string {
  let cleaned = text;
  
  // Stage 1: Basic normalization
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .trim();
  
  // Stage 2: OCR error correction
  const ocrCorrections = [
    // Common OCR mistakes
    [/[|]/g, 'I'],
    [/[0O]/g, 'O'],
    [/[5S]/g, 'S'],
    [/[1Il]/g, 'I'],
    [/rn/g, 'm'],
    [/vv/g, 'w'],
    [/\bforrn\b/gi, 'form'],
    [/\bNarne\b/gi, 'Name'],
    [/\bDafe\b/gi, 'Date'],
    [/\bBirfh\b/gi, 'Birth'],
    [/\bCerfificate\b/gi, 'Certificate'],
    [/\bNurnber\b/gi, 'Number'],
    [/\bOverall\b/gi, 'Overall'],
    [/\bListening\b/gi, 'Listening'],
    [/\bReading\b/gi, 'Reading'],
    [/\bWriting\b/gi, 'Writing'],
    [/\bSpeaking\b/gi, 'Speaking'],
  ];
  
  for (const [pattern, replacement] of ocrCorrections) {
    cleaned = cleaned.replace(pattern, replacement as string);
  }
  
  // Stage 3: Structure normalization
  cleaned = cleaned
    .replace(/([A-Z]+)\s*:\s*/g, '$1: ') // Normalize colons
    .replace(/(\d+)\s*[.,]\s*(\d+)/g, '$1.$2') // Normalize decimal points
    .replace(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g, '$1/$2/$3') // Normalize dates
    .replace(/\s*\|\s*/g, ' | ') // Normalize separators
    .replace(/\s*\n\s*/g, ' '); // Remove line breaks
  
  return cleaned;
}

/**
 * Detect certificate type với confidence scoring
 */
function detectCertificateTypeWithConfidence(text: string): { type: string; confidence: number } {
  const patterns = [
    {
      type: 'IELTS',
      patterns: [
        /IELTS/i,
        /International English Language Testing System/i,
        /Test Report Form/i,
        /Overall Band Score/i,
        /British Council|IDP/i
      ],
      weight: 15
    },
    {
      type: 'TOEFL',
      patterns: [
        /TOEFL/i,
        /Test of English as a Foreign Language/i,
        /ETS/i,
        /iBT/i,
        /Total Score.*1[0-2][0-9]/i
      ],
      weight: 15
    },
    {
      type: 'TOEIC',
      patterns: [
        /TOEIC/i,
        /Test of English for International Communication/i,
        /Listening and Reading/i,
        /Total Score.*[0-9]{3}/i
      ],
      weight: 15
    },
    {
      type: 'VSTEP',
      patterns: [
        /VSTEP/i,
        /Vietnamese Standardized Test/i,
        /Bộ Giáo dục/i,
        /Ministry of Education/i
      ],
      weight: 12
    },
    {
      type: 'HSK',
      patterns: [
        /HSK/i,
        /Hanyu Shuiping Kaoshi/i,
        /Chinese Proficiency/i,
        /Confucius Institute/i
      ],
      weight: 10
    },
    {
      type: 'JLPT',
      patterns: [
        /JLPT/i,
        /Japanese Language Proficiency Test/i,
        /Japan Foundation/i,
        /N[1-5]/i
      ],
      weight: 10
    }
  ];

  let bestMatch = { type: '', confidence: 0 };
  
  for (const { type, patterns: typePatterns, weight } of patterns) {
    let score = 0;
    let matchCount = 0;
    
    for (const pattern of typePatterns) {
      if (pattern.test(text)) {
        score += weight;
        matchCount++;
      }
    }
    
    // Bonus for multiple matches
    if (matchCount > 1) {
      score += matchCount * 2;
    }
    
    if (score > bestMatch.confidence) {
      bestMatch = { type, confidence: Math.min(25, score) };
    }
  }
  
  return bestMatch;
}

/**
 * Extract name với multiple strategies
 */
function extractNameWithMultipleStrategies(text: string): { name: string; confidence: number } {
  const strategies = [
    // Strategy 1: IELTS specific patterns
    {
      pattern: /Family\s+Name[:\s]*([A-Z]+)\s+First\s+Name[:\s]*([A-Z\s]+)/i,
      extractor: (match: RegExpMatchArray) => `${match[2].trim()} ${match[1].trim()}`,
      confidence: 25
    },
    
    // Strategy 2: General candidate name
    {
      pattern: /(?:Candidate\s+)?Name[:\s]*([A-Z][A-Za-z\s]{5,50})/i,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 20
    },
    
    // Strategy 3: Vietnamese name pattern
    {
      pattern: /Họ\s+và\s+tên[:\s]*([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{5,50})/i,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 20
    },
    
    // Strategy 4: Context-based extraction
    {
      pattern: /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s+(?:Date|DOB|Candidate|Form)/i,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 15
    },
    
    // Strategy 5: Loose pattern with validation
    {
      pattern: /\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/g,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 10
    }
  ];

  const candidates: Array<{ name: string; confidence: number; score: number }> = [];
  
  for (const strategy of strategies) {
    // Use match with global flag instead of matchAll for better compatibility
    const globalPattern = new RegExp(strategy.pattern.source, strategy.pattern.flags.includes('g') ? strategy.pattern.flags : strategy.pattern.flags + 'g');
    
    let match;
    while ((match = globalPattern.exec(text)) !== null) {
      try {
        const name = strategy.extractor(match);
        const validationScore = validateNameQuality(name);
        
        if (validationScore > 0) {
          candidates.push({
            name,
            confidence: strategy.confidence,
            score: validationScore
          });
        }
      } catch (error) {
        console.warn('Name extraction error:', error);
      }
    }
  }
  
  // Select best candidate
  if (candidates.length === 0) {
    return { name: '', confidence: 0 };
  }
  
  // Sort by combined score
  candidates.sort((a, b) => (b.confidence + b.score) - (a.confidence + a.score));
  
  const best = candidates[0];
  return {
    name: best.name,
    confidence: Math.min(25, best.confidence + Math.floor(best.score / 2))
  };
}

/**
 * Validate name quality
 */
function validateNameQuality(name: string): number {
  if (!name || name.length < 3) return 0;
  
  const words = name.split(/\s+/).filter(word => word.length > 0);
  let score = 0;
  
  // Check word count (2-4 words is typical)
  if (words.length >= 2 && words.length <= 4) score += 20;
  else if (words.length === 1) score += 5;
  else return 0; // Too many or too few words
  
  // Check word lengths
  const validWords = words.filter(word => word.length >= 2 && word.length <= 15);
  if (validWords.length === words.length) score += 15;
  
  // Check character composition
  const hasOnlyLetters = /^[A-Za-zÀ-ỹ\s]+$/.test(name);
  if (hasOnlyLetters) score += 15;
  
  // Check capitalization
  const isProperlyCapitalized = words.every(word => /^[A-ZÀ-Ỹ][a-zà-ỹ]*$/.test(word));
  if (isProperlyCapitalized) score += 10;
  
  // Penalize common OCR errors
  if (/\d/.test(name)) score -= 20; // Contains numbers
  if (/[|_]/.test(name)) score -= 15; // Contains OCR artifacts
  if (name.length > 50) score -= 10; // Too long
  
  return Math.max(0, score);
}

/**
 * Extract dates với context awareness
 */
function extractDatesWithContext(text: string): { 
  dateOfBirth?: string; 
  examDate?: string; 
  issueDate?: string; 
  confidence: number 
} {
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g
  ];
  
  const contextKeywords = {
    dateOfBirth: ['date of birth', 'dob', 'birth date', 'ngày sinh', 'born'],
    examDate: ['date', 'test date', 'exam date', 'examination date', 'ngày thi', 'test report date'],
    issueDate: ['issue date', 'date of issue', 'issued', 'ngày cấp', 'certificate date']
  };
  
  const foundDates: Array<{ date: string; context: string; type?: string }> = [];
  
  // Extract all dates with context
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const date = match[1];
      const startPos = match.index;
      const endPos = startPos + date.length;
      
      // Get surrounding context (50 chars before and after)
      const contextStart = Math.max(0, startPos - 50);
      const contextEnd = Math.min(text.length, endPos + 50);
      const context = text.substring(contextStart, contextEnd).toLowerCase();
      
      foundDates.push({ date, context });
    }
  }
  
  const result: { dateOfBirth?: string; examDate?: string; issueDate?: string; confidence: number } = {
    confidence: 0
  };
  
  // Assign dates based on context
  for (const { date, context } of foundDates) {
    let bestMatch = { type: '', score: 0 };
    
    for (const [dateType, keywords] of Object.entries(contextKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (context.includes(keyword)) {
          score += keyword.length; // Longer keywords get higher scores
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { type: dateType, score };
      }
    }
    
    if (bestMatch.score > 0) {
      (result as any)[bestMatch.type] = date;
      result.confidence += Math.min(10, bestMatch.score);
    } else if (!result.examDate) {
      // Default to exam date if no context found
      result.examDate = date;
      result.confidence += 5;
    }
  }
  
  return result;
}

/**
 * Advanced certificate number extraction
 */
function extractCertificateNumberAdvanced(text: string, certificateType?: string): { 
  number: string; 
  confidence: number 
} {
  const strategies = [
    // IELTS specific
    {
      pattern: /(?:Test\s+Report\s+)?Form\s+Number[:\s]*([A-Z0-9]{8,20})/i,
      confidence: 25,
      types: ['IELTS']
    },
    
    // General certificate patterns
    {
      pattern: /(?:Certificate|Cert)\s+(?:Number|No|#)[:\s]*([A-Z0-9\-]{6,20})/i,
      confidence: 20,
      types: ['TOEFL', 'TOEIC', 'VSTEP']
    },
    
    // Registration number
    {
      pattern: /(?:Registration|Reg)\s+(?:Number|No|#)[:\s]*([A-Z0-9\-]{6,20})/i,
      confidence: 20,
      types: ['TOEIC', 'TOEFL']
    },
    
    // Candidate number
    {
      pattern: /Candidate\s+Number[:\s]*(\d{8,15})/i,
      confidence: 18,
      types: ['IELTS', 'TOEFL']
    },
    
    // Pattern-based extraction
    {
      pattern: /\b([A-Z]{2,4}\d{6,12}[A-Z0-9]*)\b/g,
      confidence: 15,
      types: ['IELTS', 'TOEFL', 'TOEIC']
    },
    
    // Numeric patterns
    {
      pattern: /\b(\d{10,15})\b/g,
      confidence: 10,
      types: ['TOEIC', 'VSTEP']
    }
  ];
  
  const candidates: Array<{ number: string; confidence: number }> = [];
  
  for (const strategy of strategies) {
    // Skip if strategy doesn't match certificate type
    if (certificateType && strategy.types && !strategy.types.includes(certificateType)) {
      continue;
    }
    
    // Use exec with global flag instead of matchAll for better compatibility
    const globalPattern = new RegExp(strategy.pattern.source, strategy.pattern.flags.includes('g') ? strategy.pattern.flags : strategy.pattern.flags + 'g');
    
    let match;
    while ((match = globalPattern.exec(text)) !== null) {
      const number = match[1]?.trim();
      if (number && validateCertificateNumber(number, certificateType)) {
        candidates.push({
          number,
          confidence: strategy.confidence
        });
      }
    }
  }
  
  if (candidates.length === 0) {
    return { number: '', confidence: 0 };
  }
  
  // Return the candidate with highest confidence
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0];
}

/**
 * Validate certificate number
 */
function validateCertificateNumber(number: string, certificateType?: string): boolean {
  if (!number || number.length < 4 || number.length > 25) return false;
  
  // Type-specific validation
  switch (certificateType) {
    case 'IELTS':
      return /^[A-Z0-9]{6,20}$/.test(number) && !/^\d+$/.test(number);
    case 'TOEIC':
      return /^[A-Z0-9\-]{6,20}$/.test(number);
    case 'TOEFL':
      return /^[A-Z0-9\-]{6,20}$/.test(number);
    case 'VSTEP':
      return /^[A-Z0-9\-]{6,20}$/.test(number);
    default:
      return /^[A-Z0-9\-]{4,25}$/.test(number);
  }
}

/**
 * Intelligent score extraction với validation
 */
function extractScoresIntelligent(text: string, certificateType?: string): {
  scores: any;
  confidence: number;
} {
  switch (certificateType) {
    case 'IELTS':
      return extractIELTSScoresAdvanced(text);
    case 'TOEIC':
      return extractTOEICScoresAdvanced(text);
    case 'TOEFL':
      return extractTOEFLScoresAdvanced(text);
    case 'VSTEP':
      return extractVSTEPScoresAdvanced(text);
    default:
      return extractGenericScores(text);
  }
}

/**
 * Advanced IELTS score extraction
 */
function extractIELTSScoresAdvanced(text: string): { scores: any; confidence: number } {
  const scores: any = {};
  let confidence = 0;
  
  const skillPatterns = [
    {
      skill: 'listening',
      patterns: [
        /Listening[:\s]*(\d+\.?\d*)/i,
        /L[:\s]*(\d+\.?\d*)/i,
        /Nghe[:\s]*(\d+\.?\d*)/i
      ]
    },
    {
      skill: 'reading',
      patterns: [
        /Reading[:\s]*(\d+\.?\d*)/i,
        /R[:\s]*(\d+\.?\d*)/i,
        /Đọc[:\s]*(\d+\.?\d*)/i
      ]
    },
    {
      skill: 'writing',
      patterns: [
        /Writing[:\s]*(\d+\.?\d*)/i,
        /W[:\s]*(\d+\.?\d*)/i,
        /Viết[:\s]*(\d+\.?\d*)/i
      ]
    },
    {
      skill: 'speaking',
      patterns: [
        /Speaking[:\s]*(\d+\.?\d*)/i,
        /S[:\s]*(\d+\.?\d*)/i,
        /Nói[:\s]*(\d+\.?\d*)/i
      ]
    }
  ];
  
  // Extract individual skills
  for (const { skill, patterns } of skillPatterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 9) {
          scores[skill] = score;
          confidence += 8;
          console.log(`✅ IELTS ${skill}: ${score}`);
          break;
        }
      }
    }
  }
  
  // Extract overall band score với multiple patterns
  const overallPatterns = [
    /Overall\s+Band\s+Score[:\s]*(\d+\.?\d*)/i,
    /Band\s+Score[:\s]*(\d+\.?\d*)/i,
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
        confidence += 10;
        console.log(`✅ IELTS Overall: ${score}`);
        break;
      }
    }
  }
  
  // Calculate overall if missing but have individual scores
  if (!scores.overall && Object.keys(scores).length >= 3) {
    const skillScores = Object.values(scores).filter(s => typeof s === 'number') as number[];
    if (skillScores.length >= 3) {
      scores.overall = Math.round((skillScores.reduce((a, b) => a + b, 0) / skillScores.length) * 2) / 2;
      confidence += 5;
      console.log(`📊 IELTS Overall calculated: ${scores.overall}`);
    }
  }
  
  return { scores, confidence: Math.min(50, confidence) };
}

/**
 * Advanced TOEIC score extraction
 */
function extractTOEICScoresAdvanced(text: string): { scores: any; confidence: number } {
  const scores: any = {};
  let confidence = 0;
  
  const patterns = [
    {
      skill: 'total',
      patterns: [
        /Total\s+Score[:\s]*(\d{3,4})/i,
        /Score[:\s]*(\d{3,4})/i,
        /Tổng\s+điểm[:\s]*(\d{3,4})/i
      ],
      range: [10, 990]
    },
    {
      skill: 'listening',
      patterns: [
        /Listening[:\s]*(\d{2,3})/i,
        /L[:\s]*(\d{2,3})/i,
        /Nghe[:\s]*(\d{2,3})/i
      ],
      range: [5, 495]
    },
    {
      skill: 'reading',
      patterns: [
        /Reading[:\s]*(\d{2,3})/i,
        /R[:\s]*(\d{2,3})/i,
        /Đọc[:\s]*(\d{2,3})/i
      ],
      range: [5, 495]
    }
  ];
  
  for (const { skill, patterns: skillPatterns, range } of patterns) {
    for (const pattern of skillPatterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseInt(match[1]);
        if (score >= range[0] && score <= range[1]) {
          scores[skill] = score;
          confidence += skill === 'total' ? 15 : 10;
          console.log(`✅ TOEIC ${skill}: ${score}`);
          break;
        }
      }
    }
  }
  
  // Calculate total if missing but have L&R
  if (!scores.total && scores.listening && scores.reading) {
    scores.total = scores.listening + scores.reading;
    confidence += 5;
    console.log(`📊 TOEIC Total calculated: ${scores.total}`);
  }
  
  return { scores, confidence: Math.min(40, confidence) };
}

/**
 * Advanced TOEFL score extraction
 */
function extractTOEFLScoresAdvanced(text: string): { scores: any; confidence: number } {
  const scores: any = {};
  let confidence = 0;
  
  const skillPatterns = [
    { skill: 'reading', range: [0, 30] },
    { skill: 'listening', range: [0, 30] },
    { skill: 'speaking', range: [0, 30] },
    { skill: 'writing', range: [0, 30] }
  ];
  
  for (const { skill, range } of skillPatterns) {
    const pattern = new RegExp(`${skill}[:\\s]*(\\d{1,2})`, 'i');
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= range[0] && score <= range[1]) {
        scores[skill] = score;
        confidence += 8;
        console.log(`✅ TOEFL ${skill}: ${score}`);
      }
    }
  }
  
  // Extract total score
  const totalPatterns = [
    /Total[:\s]*(\d{2,3})/i,
    /Overall[:\s]*(\d{2,3})/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 0 && score <= 120) {
        scores.total = score;
        confidence += 12;
        console.log(`✅ TOEFL Total: ${score}`);
        break;
      }
    }
  }
  
  // Calculate total if missing
  if (!scores.total && Object.keys(scores).length >= 3) {
    const skillScores = Object.values(scores).filter(s => typeof s === 'number') as number[];
    if (skillScores.length >= 3) {
      scores.total = skillScores.reduce((a, b) => a + b, 0);
      confidence += 5;
      console.log(`📊 TOEFL Total calculated: ${scores.total}`);
    }
  }
  
  return { scores, confidence: Math.min(45, confidence) };
}

/**
 * Advanced VSTEP score extraction
 */
function extractVSTEPScoresAdvanced(text: string): { scores: any; confidence: number } {
  const scores: any = {};
  let confidence = 0;
  
  const skillPatterns = [
    'listening', 'reading', 'writing', 'speaking'
  ];
  
  for (const skill of skillPatterns) {
    const patterns = [
      new RegExp(`${skill}[:\\s]*(\\d+\\.?\\d*)`, 'i'),
      new RegExp(`${skill.charAt(0)}[:\\s]*(\\d+\\.?\\d*)`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const score = parseFloat(match[1]);
        if (score >= 0 && score <= 10) {
          scores[skill] = score;
          confidence += 8;
          console.log(`✅ VSTEP ${skill}: ${score}`);
          break;
        }
      }
    }
  }
  
  // Extract overall
  const overallPatterns = [
    /Overall[:\s]*(\d+\.?\d*)/i,
    /Tổng[:\s]*(\d+\.?\d*)/i
  ];
  
  for (const pattern of overallPatterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseFloat(match[1]);
      if (score >= 0 && score <= 10) {
        scores.overall = score;
        confidence += 10;
        console.log(`✅ VSTEP Overall: ${score}`);
        break;
      }
    }
  }
  
  return { scores, confidence: Math.min(42, confidence) };
}

/**
 * Generic score extraction
 */
function extractGenericScores(text: string): { scores: any; confidence: number } {
  const scores: any = {};
  let confidence = 0;
  
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
        confidence += 10;
        console.log(`✅ Generic Score: ${score}`);
        break;
      }
    }
  }
  
  return { scores, confidence: Math.min(15, confidence) };
}

/**
 * Detect organization với context
 */
function detectOrganizationWithContext(text: string, certificateType?: string): {
  organization: string;
  confidence: number;
} {
  // Type-specific organizations
  const typeOrgMap: Record<string, Array<{ name: string; patterns: RegExp[]; confidence: number }>> = {
    'IELTS': [
      {
        name: 'British Council',
        patterns: [/British\s+Council/i, /BC/i],
        confidence: 15
      },
      {
        name: 'IDP Education',
        patterns: [/IDP/i, /IDP\s+Education/i],
        confidence: 15
      },
      {
        name: 'Cambridge Assessment English',
        patterns: [/Cambridge/i, /Cambridge\s+Assessment/i],
        confidence: 12
      }
    ],
    'TOEFL': [
      {
        name: 'ETS',
        patterns: [/ETS/i, /Educational\s+Testing\s+Service/i],
        confidence: 15
      }
    ],
    'TOEIC': [
      {
        name: 'ETS',
        patterns: [/ETS/i, /Educational\s+Testing\s+Service/i],
        confidence: 15
      }
    ],
    'VSTEP': [
      {
        name: 'Bộ Giáo dục và Đào tạo',
        patterns: [/Bộ\s+Giáo\s+dục/i, /Ministry\s+of\s+Education/i],
        confidence: 12
      }
    ]
  };
  
  // Check type-specific organizations first
  if (certificateType && typeOrgMap[certificateType]) {
    for (const { name, patterns, confidence } of typeOrgMap[certificateType]) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return { organization: name, confidence };
        }
      }
    }
  }
  
  // Generic organization patterns
  const genericPatterns = [
    {
      pattern: /(?:Issued\s+by|Issuer)[:\s]*([A-Za-z\s]{5,50})/i,
      confidence: 10
    },
    {
      pattern: /(?:Organization|Org)[:\s]*([A-Za-z\s]{5,50})/i,
      confidence: 8
    }
  ];
  
  for (const { pattern, confidence } of genericPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const org = match[1].trim();
      if (org.length >= 5 && org.length <= 50) {
        return { organization: org, confidence };
      }
    }
  }
  
  return { organization: '', confidence: 0 };
}

/**
 * Calculate final confidence với weighted scoring
 */
function calculateFinalConfidence(data: Partial<ExtractedData> & { confidence: number }): number {
  let totalWeight = 0;
  let achievedWeight = 0;
  
  const fieldWeights = {
    certificateType: { weight: 20, hasValue: !!data.certificateType && data.certificateType !== '' },
    fullName: { weight: 25, hasValue: !!data.fullName && data.fullName.length >= 5 },
    certificateNumber: { weight: 20, hasValue: !!data.certificateNumber && data.certificateNumber.length >= 6 },
    examDate: { weight: 10, hasValue: !!data.examDate },
    dateOfBirth: { weight: 10, hasValue: !!data.dateOfBirth },
    scores: { weight: 15, hasValue: !!data.scores && Object.keys(data.scores).length > 0 }
  };
  
  for (const [field, { weight, hasValue }] of Object.entries(fieldWeights)) {
    totalWeight += weight;
    if (hasValue) {
      achievedWeight += weight;
    }
  }
  
  const baseConfidence = (achievedWeight / totalWeight) * 100;
  
  // Apply quality bonuses
  let qualityBonus = 0;
  
  // Name quality bonus
  if (data.fullName) {
    const nameWords = data.fullName.split(/\s+/);
    if (nameWords.length >= 2 && nameWords.length <= 4) {
      qualityBonus += 5;
    }
  }
  
  // Score completeness bonus
  if (data.scores) {
    const scoreCount = Object.keys(data.scores).length;
    if (scoreCount >= 4) qualityBonus += 10;
    else if (scoreCount >= 2) qualityBonus += 5;
  }
  
  // Certificate type bonus
  if (data.certificateType && ['IELTS', 'TOEFL', 'TOEIC', 'VSTEP'].includes(data.certificateType)) {
    qualityBonus += 5;
  }
  
  const finalConfidence = Math.min(95, Math.max(0, baseConfidence + qualityBonus));
  
  return Math.round(finalConfidence);
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