/**
 * Certificate Image Detector
 * Phát hiện xem ảnh có phải là chứng chỉ hợp lệ hay không
 */

export interface DetectionResult {
  isCertificate: boolean;
  confidence: number;
  certificateType?: string;
  reasons: string[];
  warnings: string[];
}

export class CertificateDetector {
  /**
   * Phát hiện xem ảnh có phải là chứng chỉ không
   */
  async detectCertificate(imageFile: File, ocrText?: string): Promise<DetectionResult> {
    const result: DetectionResult = {
      isCertificate: false,
      confidence: 0,
      reasons: [],
      warnings: []
    };

    // Bước 1: Kiểm tra file type
    if (!this.isValidImageType(imageFile)) {
      result.reasons.push('File không phải là ảnh hợp lệ');
      return result;
    }

    // Bước 2: Phân tích nội dung ảnh
    const imageAnalysis = await this.analyzeImageContent(imageFile);
    
    // Bước 3: Phân tích text (nếu có)
    let textAnalysis = { score: 0, type: '', keywords: [] as string[] };
    if (ocrText) {
      textAnalysis = this.analyzeTextContent(ocrText);
    }

    // Bước 4: Tính điểm tổng hợp (normalize về 0-100)
    // Image analysis: max 40 điểm, Text analysis: max 60 điểm
    const imageScore = Math.min(40, imageAnalysis.score);
    const textScore = Math.min(60, textAnalysis.score);
    const totalScore = imageScore + textScore;
    result.confidence = Math.min(100, Math.max(0, totalScore));

    // Bước 5: Quyết định
    if (result.confidence >= 60) {
      result.isCertificate = true;
      result.certificateType = textAnalysis.type || 'UNKNOWN';
      result.reasons.push('Phát hiện đặc điểm của chứng chỉ');
      
      if (textAnalysis.keywords.length > 0) {
        result.reasons.push(`Tìm thấy từ khóa: ${textAnalysis.keywords.join(', ')}`);
      }
    } else {
      result.isCertificate = false;
      result.reasons.push('Không phát hiện đặc điểm của chứng chỉ');
      
      if (result.confidence < 30) {
        result.reasons.push('Ảnh có thể là: ảnh thông thường, tài liệu khác, hoặc ảnh không rõ');
      }
    }

    // Bước 6: Cảnh báo
    if (imageAnalysis.warnings.length > 0) {
      result.warnings.push(...imageAnalysis.warnings);
    }

    return result;
  }

  /**
   * Kiểm tra file type hợp lệ
   */
  private isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    return validTypes.includes(file.type);
  }

  /**
   * Phân tích nội dung ảnh
   */
  private async analyzeImageContent(imageFile: File): Promise<{
    score: number;
    warnings: string[];
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const warnings: string[] = [];
      let score = 0;

      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;

        // Kiểm tra kích thước
        if (width < 400 || height < 300) {
          warnings.push('Ảnh có kích thước nhỏ, có thể ảnh hưởng độ chính xác');
          score -= 10;
        } else if (width >= 800 && height >= 600) {
          score += 15; // Kích thước tốt
        }

        // Kiểm tra tỷ lệ khung hình
        // Chứng chỉ thường có tỷ lệ landscape (ngang) hoặc gần vuông
        if (aspectRatio >= 1.2 && aspectRatio <= 1.8) {
          score += 20; // Tỷ lệ giống chứng chỉ (A4 landscape)
        } else if (aspectRatio >= 0.7 && aspectRatio <= 0.9) {
          score += 15; // Tỷ lệ portrait (dọc)
        } else if (aspectRatio < 0.5 || aspectRatio > 2.5) {
          score -= 15; // Tỷ lệ quá dị thường
          warnings.push('Tỷ lệ khung hình không giống chứng chỉ');
        }

        // Phân tích màu sắc và độ phức tạp
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = Math.min(width, 400);
          canvas.height = Math.min(height, 300);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const colorAnalysis = this.analyzeColors(imageData.data);
          
          score += colorAnalysis.score;
          if (colorAnalysis.warnings.length > 0) {
            warnings.push(...colorAnalysis.warnings);
          }
        }

        URL.revokeObjectURL(img.src);
        resolve({ score, warnings });
      };

      img.onerror = () => {
        warnings.push('Không thể đọc ảnh');
        resolve({ score: 0, warnings });
      };

      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Phân tích màu sắc
   */
  private analyzeColors(data: Uint8ClampedArray): {
    score: number;
    warnings: string[];
  } {
    let score = 0;
    const warnings: string[] = [];

    // Tính độ sáng trung bình
    let totalBrightness = 0;
    let whitePixels = 0;
    let colorfulPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;

      // Đếm pixel trắng (chứng chỉ thường có nhiều vùng trắng)
      if (r > 240 && g > 240 && b > 240) {
        whitePixels++;
      }

      // Đếm pixel màu (chứng chỉ thường có ít màu sắc)
      const colorDiff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
      if (colorDiff > 50) {
        colorfulPixels++;
      }
    }

    const pixelCount = data.length / 4;
    const avgBrightness = totalBrightness / pixelCount;
    const whiteRatio = whitePixels / pixelCount;
    const colorRatio = colorfulPixels / pixelCount;

    // Chứng chỉ thường có:
    // - Độ sáng cao (nhiều vùng trắng)
    // - Ít màu sắc (chủ yếu đen trắng với một số màu nhấn)

    if (avgBrightness > 200) {
      score += 10; // Ảnh sáng, giống chứng chỉ
    } else if (avgBrightness < 100) {
      score -= 10; // Ảnh tối
      warnings.push('Ảnh quá tối, có thể không phải chứng chỉ');
    }

    if (whiteRatio > 0.4) {
      score += 15; // Nhiều vùng trắng
    } else if (whiteRatio < 0.1) {
      score -= 10; // Quá ít vùng trắng
    }

    if (colorRatio < 0.3) {
      score += 10; // Ít màu sắc, giống chứng chỉ
    } else if (colorRatio > 0.6) {
      score -= 15; // Quá nhiều màu, có thể là ảnh thông thường
      warnings.push('Ảnh có nhiều màu sắc, có thể không phải chứng chỉ');
    }

    return { score, warnings };
  }

  /**
   * Phân tích nội dung text
   */
  private analyzeTextContent(text: string): {
    score: number;
    type: string;
    keywords: string[];
  } {
    let score = 0;
    let type = '';
    const foundKeywords: string[] = [];

    const cleanText = text.toLowerCase();

    // Từ khóa chứng chỉ chung
    const generalKeywords = [
      'certificate', 'certification', 'chứng chỉ', 'chứng nhận',
      'test report', 'score', 'điểm', 'band', 'level',
      'candidate', 'thí sinh', 'student', 'học viên',
      'date of birth', 'ngày sinh', 'exam date', 'ngày thi',
      'issued by', 'cấp bởi', 'organization', 'tổ chức'
    ];

    for (const keyword of generalKeywords) {
      if (cleanText.includes(keyword)) {
        score += 5;
        foundKeywords.push(keyword);
      }
    }

    // Từ khóa theo loại chứng chỉ
    const certificateTypes = [
      {
        type: 'IELTS',
        keywords: [
          'ielts',
          'international english language testing system',
          'british council',
          'idp',
          'listening', 'reading', 'writing', 'speaking',
          'overall band score',
          'test report form'
        ],
        weight: 10
      },
      {
        type: 'TOEIC',
        keywords: [
          'toeic',
          'test of english for international communication',
          'listening and reading',
          'ets',
          'total score'
        ],
        weight: 10
      },
      {
        type: 'TOEFL',
        keywords: [
          'toefl',
          'test of english as a foreign language',
          'ibt',
          'ets',
          'educational testing service'
        ],
        weight: 10
      },
      {
        type: 'VSTEP',
        keywords: [
          'vstep',
          'vietnamese standardized test',
          'bộ giáo dục',
          'ministry of education'
        ],
        weight: 10
      },
      {
        type: 'HSK',
        keywords: [
          'hsk',
          'hanyu shuiping kaoshi',
          'chinese proficiency',
          'confucius institute',
          '汉语'
        ],
        weight: 8
      },
      {
        type: 'JLPT',
        keywords: [
          'jlpt',
          'japanese language proficiency test',
          'japan foundation',
          'n1', 'n2', 'n3', 'n4', 'n5',
          '日本語'
        ],
        weight: 8
      }
    ];

    let maxTypeScore = 0;
    for (const certType of certificateTypes) {
      let typeScore = 0;
      for (const keyword of certType.keywords) {
        if (cleanText.includes(keyword)) {
          typeScore += certType.weight;
          foundKeywords.push(keyword);
        }
      }
      
      if (typeScore > maxTypeScore) {
        maxTypeScore = typeScore;
        type = certType.type;
      }
    }

    score += maxTypeScore;

    // Kiểm tra có số điểm không
    const scorePatterns = [
      /\b\d+\.?\d*\s*(?:band|score|điểm)\b/i,
      /\b(?:listening|reading|writing|speaking)[:\s]+\d+\.?\d*\b/i,
      /\b(?:overall|total)[:\s]+\d+\.?\d*\b/i
    ];

    for (const pattern of scorePatterns) {
      if (pattern.test(text)) {
        score += 10;
        break;
      }
    }

    // Kiểm tra có số chứng chỉ không
    const certNumberPatterns = [
      /\b(?:certificate|cert|form)\s+(?:number|no|#)[:\s]*[A-Z0-9\-]{6,20}\b/i,
      /\b[A-Z]{2,4}\d{6,12}[A-Z0-9]*\b/
    ];

    for (const pattern of certNumberPatterns) {
      if (pattern.test(text)) {
        score += 10;
        break;
      }
    }

    // Kiểm tra có ngày tháng không
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/;
    if (datePattern.test(text)) {
      score += 5;
    }

    return { score, type, keywords: foundKeywords };
  }

  /**
   * Phát hiện nhanh (chỉ dựa vào text)
   */
  quickDetect(text: string): boolean {
    const analysis = this.analyzeTextContent(text);
    return analysis.score >= 30;
  }
}

// Export singleton
export const certificateDetector = new CertificateDetector();

/**
 * Quick detection function
 */
export async function detectCertificate(
  imageFile: File,
  ocrText?: string
): Promise<DetectionResult> {
  return certificateDetector.detectCertificate(imageFile, ocrText);
}
