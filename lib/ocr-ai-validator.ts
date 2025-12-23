/**
 * AI-powered OCR Validation và Post-processing Service
 * Nâng cao độ chính xác thông qua validation logic thông minh
 */

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  suggestions: string[];
  correctedData?: any;
}

export interface CertificateValidationRules {
  certificateType: string;
  namePattern: RegExp;
  numberPattern: RegExp;
  scoreRanges: Record<string, [number, number]>;
  dateFormats: string[];
  requiredFields: string[];
}

/**
 * AI-powered Certificate Data Validator
 */
export class CertificateDataValidator {
  private validationRules: Record<string, CertificateValidationRules> = {
    'IELTS': {
      certificateType: 'IELTS',
      namePattern: /^[A-Z][A-Za-z\s]{2,50}$/,
      numberPattern: /^[A-Z0-9]{6,20}$/,
      scoreRanges: {
        listening: [0, 9],
        reading: [0, 9],
        writing: [0, 9],
        speaking: [0, 9],
        overall: [0, 9]
      },
      dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'DD-MM-YYYY'],
      requiredFields: ['fullName', 'certificateNumber', 'scores']
    },
    'TOEIC': {
      certificateType: 'TOEIC',
      namePattern: /^[A-Z][A-Za-z\s]{2,50}$/,
      numberPattern: /^[A-Z0-9\-]{6,20}$/,
      scoreRanges: {
        listening: [5, 495],
        reading: [5, 495],
        total: [10, 990]
      },
      dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY'],
      requiredFields: ['fullName', 'certificateNumber', 'scores']
    },
    'TOEFL': {
      certificateType: 'TOEFL',
      namePattern: /^[A-Z][A-Za-z\s]{2,50}$/,
      numberPattern: /^[A-Z0-9\-]{6,20}$/,
      scoreRanges: {
        reading: [0, 30],
        listening: [0, 30],
        speaking: [0, 30],
        writing: [0, 30],
        total: [0, 120]
      },
      dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY'],
      requiredFields: ['fullName', 'certificateNumber', 'scores']
    },
    'VSTEP': {
      certificateType: 'VSTEP',
      namePattern: /^[A-ZÀ-Ỹ][A-Za-zÀ-ỹ\s]{2,50}$/,
      numberPattern: /^[A-Z0-9\-]{6,20}$/,
      scoreRanges: {
        listening: [0, 10],
        reading: [0, 10],
        writing: [0, 10],
        speaking: [0, 10],
        overall: [0, 10]
      },
      dateFormats: ['DD/MM/YYYY'],
      requiredFields: ['fullName', 'certificateNumber', 'scores']
    }
  };

  /**
   * Validate extracted certificate data
   */
  validateCertificateData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      confidence: 100,
      errors: [],
      suggestions: [],
      correctedData: { ...data }
    };

    if (!data.certificateType) {
      result.errors.push('Không xác định được loại chứng chỉ');
      result.isValid = false;
      result.confidence -= 30;
      return result;
    }

    const rules = this.validationRules[data.certificateType];
    if (!rules) {
      result.errors.push(`Chưa hỗ trợ validation cho ${data.certificateType}`);
      result.confidence -= 20;
      return result;
    }

    // Validate each field
    this.validateName(data, rules, result);
    this.validateCertificateNumber(data, rules, result);
    this.validateDates(data, rules, result);
    this.validateScores(data, rules, result);
    this.validateRequiredFields(data, rules, result);

    // Apply AI corrections
    this.applyAICorrections(data, rules, result);

    // Calculate final confidence
    result.confidence = Math.max(0, result.confidence);
    result.isValid = result.errors.length === 0 && result.confidence >= 60;

    return result;
  }

  /**
   * Validate name field
   */
  private validateName(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    if (!data.fullName) {
      result.errors.push('Thiếu thông tin họ tên');
      result.confidence -= 25;
      return;
    }

    const name = data.fullName.trim();
    
    // Check pattern
    if (!rules.namePattern.test(name)) {
      result.errors.push('Định dạng tên không hợp lệ');
      result.confidence -= 15;
      
      // Try to correct
      const correctedName = this.correctName(name);
      if (correctedName !== name) {
        result.correctedData.fullName = correctedName;
        result.suggestions.push(`Đề xuất sửa tên: "${correctedName}"`);
        result.confidence += 5;
      }
    }

    // Check length
    if (name.length < 3 || name.length > 50) {
      result.errors.push('Độ dài tên không hợp lệ (3-50 ký tự)');
      result.confidence -= 10;
    }

    // Check word count
    const words = name.split(/\s+/).filter((w: string) => w.length > 0);
    if (words.length < 2 || words.length > 4) {
      result.suggestions.push('Tên thường có 2-4 từ');
      result.confidence -= 5;
    }
  }

  /**
   * Correct name format
   */
  private correctName(name: string): string {
    return name
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  /**
   * Validate certificate number
   */
  private validateCertificateNumber(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    if (!data.certificateNumber) {
      result.errors.push('Thiếu số chứng chỉ');
      result.confidence -= 20;
      return;
    }

    const number = data.certificateNumber.trim();
    
    if (!rules.numberPattern.test(number)) {
      result.errors.push('Định dạng số chứng chỉ không hợp lệ');
      result.confidence -= 15;
      
      // Try to correct
      const correctedNumber = this.correctCertificateNumber(number, rules.certificateType);
      if (correctedNumber !== number) {
        result.correctedData.certificateNumber = correctedNumber;
        result.suggestions.push(`Đề xuất sửa số chứng chỉ: "${correctedNumber}"`);
        result.confidence += 5;
      }
    }
  }

  /**
   * Correct certificate number format
   */
  private correctCertificateNumber(number: string, type: string): string {
    let corrected = number
      .replace(/[^A-Z0-9\-]/g, '') // Remove invalid characters
      .toUpperCase();

    // Type-specific corrections
    switch (type) {
      case 'IELTS':
        // IELTS numbers are usually alphanumeric without dashes
        corrected = corrected.replace(/\-/g, '');
        break;
      case 'TOEIC':
      case 'TOEFL':
        // These can have dashes
        break;
    }

    return corrected;
  }

  /**
   * Validate dates
   */
  private validateDates(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    const dateFields = ['dateOfBirth', 'examDate', 'issueDate'];
    
    for (const field of dateFields) {
      if (data[field]) {
        const dateValidation = this.validateDate(data[field]);
        if (!dateValidation.isValid) {
          result.errors.push(`${field}: ${dateValidation.error}`);
          result.confidence -= 8;
          
          if (dateValidation.corrected) {
            result.correctedData[field] = dateValidation.corrected;
            result.suggestions.push(`Đề xuất sửa ${field}: "${dateValidation.corrected}"`);
            result.confidence += 3;
          }
        }
      }
    }

    // Cross-validate dates
    this.crossValidateDates(data, result);
  }

  /**
   * Validate individual date
   */
  private validateDate(dateStr: string): { isValid: boolean; error?: string; corrected?: string } {
    if (!dateStr) return { isValid: true };

    // Try to parse date
    const datePatterns = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    ];

    for (const pattern of datePatterns) {
      const match = dateStr.match(pattern);
      if (match) {
        let day, month, year;
        
        if (match[3].length === 4) {
          // DD/MM/YYYY or DD-MM-YYYY
          day = parseInt(match[1]);
          month = parseInt(match[2]);
          year = parseInt(match[3]);
        } else {
          // YYYY/MM/DD or YYYY-MM-DD
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        }

        // Validate ranges
        if (month < 1 || month > 12) {
          return { isValid: false, error: 'Tháng không hợp lệ (1-12)' };
        }
        
        if (day < 1 || day > 31) {
          return { isValid: false, error: 'Ngày không hợp lệ (1-31)' };
        }
        
        if (year < 1900 || year > new Date().getFullYear() + 1) {
          return { isValid: false, error: 'Năm không hợp lệ' };
        }

        // Try to create date to validate
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          return { isValid: false, error: 'Ngày không tồn tại' };
        }

        // Normalize format to DD/MM/YYYY
        const normalized = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
        
        return { 
          isValid: true, 
          corrected: normalized !== dateStr ? normalized : undefined 
        };
      }
    }

    return { isValid: false, error: 'Định dạng ngày không hợp lệ' };
  }

  /**
   * Cross-validate dates for logical consistency
   */
  private crossValidateDates(data: any, result: ValidationResult) {
    const { dateOfBirth, examDate, issueDate } = data;
    
    if (dateOfBirth && examDate) {
      const birthDate = this.parseDate(dateOfBirth);
      const examDateParsed = this.parseDate(examDate);
      
      if (birthDate && examDateParsed) {
        const age = examDateParsed.getFullYear() - birthDate.getFullYear();
        if (age < 10 || age > 100) {
          result.suggestions.push('Tuổi khi thi có vẻ không hợp lý');
          result.confidence -= 5;
        }
      }
    }

    if (examDate && issueDate) {
      const examDateParsed = this.parseDate(examDate);
      const issueDateParsed = this.parseDate(issueDate);
      
      if (examDateParsed && issueDateParsed) {
        if (issueDateParsed < examDateParsed) {
          result.errors.push('Ngày cấp chứng chỉ không thể trước ngày thi');
          result.confidence -= 10;
        }
        
        const daysDiff = (issueDateParsed.getTime() - examDateParsed.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 90) {
          result.suggestions.push('Khoảng cách giữa ngày thi và ngày cấp có vẻ dài');
          result.confidence -= 3;
        }
      }
    }
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date | null {
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
    return null;
  }

  /**
   * Validate scores
   */
  private validateScores(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    if (!data.scores || Object.keys(data.scores).length === 0) {
      result.errors.push('Thiếu thông tin điểm số');
      result.confidence -= 20;
      return;
    }

    const scores = data.scores;
    let validScoreCount = 0;
    let totalScoreCount = 0;

    for (const [skill, range] of Object.entries(rules.scoreRanges)) {
      totalScoreCount++;
      
      if (scores[skill] !== undefined && scores[skill] !== null && scores[skill] !== '') {
        const score = parseFloat(scores[skill]);
        
        if (isNaN(score)) {
          result.errors.push(`Điểm ${skill} không phải là số`);
          result.confidence -= 8;
        } else if (score < range[0] || score > range[1]) {
          result.errors.push(`Điểm ${skill} nằm ngoài phạm vi hợp lệ (${range[0]}-${range[1]})`);
          result.confidence -= 10;
        } else {
          validScoreCount++;
          
          // Check for reasonable score precision
          if (rules.certificateType === 'IELTS' || rules.certificateType === 'VSTEP') {
            // IELTS/VSTEP scores should be in 0.5 increments
            if ((score * 2) % 1 !== 0) {
              result.suggestions.push(`Điểm ${skill} thường là bội số của 0.5`);
              result.confidence -= 2;
              
              // Suggest correction
              const corrected = Math.round(score * 2) / 2;
              result.correctedData.scores = { ...result.correctedData.scores, [skill]: corrected };
              result.suggestions.push(`Đề xuất sửa điểm ${skill}: ${corrected}`);
            }
          }
        }
      }
    }

    // Check score completeness
    const completeness = validScoreCount / totalScoreCount;
    if (completeness < 0.5) {
      result.suggestions.push('Thiếu nhiều điểm số quan trọng');
      result.confidence -= 15;
    } else if (completeness < 0.8) {
      result.suggestions.push('Một số điểm số bị thiếu');
      result.confidence -= 8;
    }

    // Validate score consistency
    this.validateScoreConsistency(data, rules, result);
  }

  /**
   * Validate score consistency
   */
  private validateScoreConsistency(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    const scores = data.scores;
    
    if (rules.certificateType === 'IELTS') {
      // Check if overall score is consistent with individual scores
      const individualScores = [scores.listening, scores.reading, scores.writing, scores.speaking]
        .filter(s => s !== undefined && s !== null && s !== '')
        .map(s => parseFloat(s))
        .filter(s => !isNaN(s));
      
      if (individualScores.length >= 3 && scores.overall) {
        const calculatedOverall = individualScores.reduce((a, b) => a + b, 0) / individualScores.length;
        const roundedCalculated = Math.round(calculatedOverall * 2) / 2;
        const actualOverall = parseFloat(scores.overall);
        
        if (Math.abs(roundedCalculated - actualOverall) > 0.5) {
          result.suggestions.push(`Điểm tổng có thể không khớp với điểm từng kỹ năng (tính toán: ${roundedCalculated})`);
          result.confidence -= 8;
          
          // Suggest correction
          result.correctedData.scores = { ...result.correctedData.scores, overall: roundedCalculated };
        }
      }
    } else if (rules.certificateType === 'TOEIC') {
      // Check if total score equals listening + reading
      if (scores.listening && scores.reading && scores.total) {
        const calculatedTotal = parseFloat(scores.listening) + parseFloat(scores.reading);
        const actualTotal = parseFloat(scores.total);
        
        if (Math.abs(calculatedTotal - actualTotal) > 5) {
          result.suggestions.push(`Điểm tổng có thể không khớp (L+R = ${calculatedTotal})`);
          result.confidence -= 10;
          
          // Suggest correction
          result.correctedData.scores = { ...result.correctedData.scores, total: calculatedTotal };
        }
      }
    } else if (rules.certificateType === 'TOEFL') {
      // Check if total score equals sum of all skills
      const skillScores = [scores.reading, scores.listening, scores.speaking, scores.writing]
        .filter(s => s !== undefined && s !== null && s !== '')
        .map(s => parseFloat(s))
        .filter(s => !isNaN(s));
      
      if (skillScores.length >= 3 && scores.total) {
        const calculatedTotal = skillScores.reduce((a, b) => a + b, 0);
        const actualTotal = parseFloat(scores.total);
        
        if (Math.abs(calculatedTotal - actualTotal) > 5) {
          result.suggestions.push(`Điểm tổng có thể không khớp với tổng các kỹ năng (tính toán: ${calculatedTotal})`);
          result.confidence -= 8;
          
          // Suggest correction if we have all 4 skills
          if (skillScores.length === 4) {
            result.correctedData.scores = { ...result.correctedData.scores, total: calculatedTotal };
          }
        }
      }
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    for (const field of rules.requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        result.errors.push(`Thiếu trường bắt buộc: ${field}`);
        result.confidence -= 15;
      }
    }
  }

  /**
   * Apply AI-powered corrections
   */
  private applyAICorrections(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    // Auto-correct common OCR mistakes in names
    if (data.fullName) {
      const correctedName = this.applyNameCorrections(data.fullName);
      if (correctedName !== data.fullName) {
        result.correctedData.fullName = correctedName;
        result.suggestions.push(`AI đề xuất sửa tên: "${correctedName}"`);
        result.confidence += 3;
      }
    }

    // Auto-correct certificate numbers
    if (data.certificateNumber) {
      const correctedNumber = this.applyCertificateNumberCorrections(data.certificateNumber, rules.certificateType);
      if (correctedNumber !== data.certificateNumber) {
        result.correctedData.certificateNumber = correctedNumber;
        result.suggestions.push(`AI đề xuất sửa số chứng chỉ: "${correctedNumber}"`);
        result.confidence += 3;
      }
    }

    // Fill missing scores if possible
    this.fillMissingScores(data, rules, result);
  }

  /**
   * Apply name corrections
   */
  private applyNameCorrections(name: string): string {
    const corrections = [
      // Common OCR mistakes
      [/\brn\b/gi, 'm'],
      [/\bvv\b/gi, 'w'],
      [/\b1\b/g, 'I'],
      [/\b0\b/g, 'O'],
      [/\b5\b/g, 'S'],
      // Vietnamese specific
      [/\bNGUYEN\b/g, 'NGUYEN'],
      [/\bTRAN\b/g, 'TRAN'],
      [/\bLE\b/g, 'LE'],
      [/\bPHAM\b/g, 'PHAM'],
      [/\bHOANG\b/g, 'HOANG'],
      [/\bVU\b/g, 'VU'],
      [/\bVO\b/g, 'VO'],
      [/\bDO\b/g, 'DO'],
      [/\bDANG\b/g, 'DANG'],
      [/\bBUI\b/g, 'BUI']
    ];

    let corrected = name;
    for (const [pattern, replacement] of corrections) {
      corrected = corrected.replace(pattern as RegExp, replacement as string);
    }

    return corrected;
  }

  /**
   * Apply certificate number corrections
   */
  private applyCertificateNumberCorrections(number: string, type: string): string {
    let corrected = number
      .replace(/[Il1]/g, '1')
      .replace(/[O0]/g, '0')
      .replace(/[S5]/g, '5')
      .toUpperCase();

    // Type-specific corrections
    switch (type) {
      case 'IELTS':
        // IELTS numbers often start with specific patterns
        if (corrected.match(/^\d/)) {
          // If starts with number, might be missing prefix
          corrected = 'IELTS' + corrected;
        }
        break;
    }

    return corrected;
  }

  /**
   * Fill missing scores using AI logic
   */
  private fillMissingScores(data: any, rules: CertificateValidationRules, result: ValidationResult) {
    if (!data.scores) return;

    const scores = data.scores;

    if (rules.certificateType === 'IELTS') {
      // Calculate missing overall score
      const individualScores = [scores.listening, scores.reading, scores.writing, scores.speaking]
        .filter(s => s !== undefined && s !== null && s !== '')
        .map(s => parseFloat(s))
        .filter(s => !isNaN(s));

      if (individualScores.length >= 3 && !scores.overall) {
        const calculatedOverall = individualScores.reduce((a, b) => a + b, 0) / individualScores.length;
        const roundedOverall = Math.round(calculatedOverall * 2) / 2;
        
        result.correctedData.scores = { ...result.correctedData.scores, overall: roundedOverall };
        result.suggestions.push(`AI tính toán điểm tổng: ${roundedOverall}`);
        result.confidence += 5;
      }
    } else if (rules.certificateType === 'TOEIC') {
      // Calculate missing total score
      if (scores.listening && scores.reading && !scores.total) {
        const calculatedTotal = parseFloat(scores.listening) + parseFloat(scores.reading);
        result.correctedData.scores = { ...result.correctedData.scores, total: calculatedTotal };
        result.suggestions.push(`AI tính toán điểm tổng: ${calculatedTotal}`);
        result.confidence += 5;
      }
    }
  }

  /**
   * Get validation summary
   */
  getValidationSummary(result: ValidationResult): string {
    if (result.isValid) {
      return `✅ Dữ liệu hợp lệ (${result.confidence}% tin cậy)`;
    } else {
      const errorCount = result.errors.length;
      const suggestionCount = result.suggestions.length;
      return `⚠️ Có ${errorCount} lỗi, ${suggestionCount} đề xuất (${result.confidence}% tin cậy)`;
    }
  }
}

/**
 * Export singleton instance
 */
export const certificateValidator = new CertificateDataValidator();

/**
 * Quick validation function
 */
export function validateCertificateData(data: any): ValidationResult {
  return certificateValidator.validateCertificateData(data);
}