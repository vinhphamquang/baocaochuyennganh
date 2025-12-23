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
  imageQuality: 'low' | 'medium' | 'high';
  enhancementApplied: string[];
}

/**
 * Phân tích chất lượng ảnh để xác định độ phân giải và độ rõ nét
 */
function analyzeImageQuality(imageFile: File): Promise<{
  quality: 'low' | 'medium' | 'high';
  width: number;
  height: number;
  pixelDensity: number;
  sharpness: number;
  contrast: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Tính pixel density
      const pixelDensity = img.width * img.height;
      
      // Tính sharpness bằng Laplacian variance
      const sharpness = calculateSharpness(data, img.width, img.height);
      
      // Tính contrast
      const contrast = calculateContrast(data);
      
      // Xác định chất lượng tổng thể
      let quality: 'low' | 'medium' | 'high' = 'medium';
      
      if (pixelDensity < 500000 || sharpness < 50 || contrast < 30) {
        quality = 'low';
      } else if (pixelDensity > 2000000 && sharpness > 100 && contrast > 60) {
        quality = 'high';
      }
      
      resolve({
        quality,
        width: img.width,
        height: img.height,
        pixelDensity,
        sharpness,
        contrast
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Tính độ sắc nét bằng Laplacian variance
 */
function calculateSharpness(data: Uint8ClampedArray, width: number, height: number): number {
  const laplacianKernel = [
    0, -1, 0,
    -1, 4, -1,
    0, -1, 0
  ];
  
  let variance = 0;
  let mean = 0;
  let count = 0;
  
  // Tính mean trước
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let laplacian = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          laplacian += gray * laplacianKernel[kernelIdx];
        }
      }
      
      mean += laplacian;
      count++;
    }
  }
  
  mean /= count;
  
  // Tính variance
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let laplacian = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          laplacian += gray * laplacianKernel[kernelIdx];
        }
      }
      
      variance += Math.pow(laplacian - mean, 2);
    }
  }
  
  return variance / count;
}

/**
 * Tính độ tương phản
 */
function calculateContrast(data: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0);
  let totalPixels = 0;
  
  // Tạo histogram
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
    totalPixels++;
  }
  
  // Tính mean
  let mean = 0;
  for (let i = 0; i < 256; i++) {
    mean += i * histogram[i];
  }
  mean /= totalPixels;
  
  // Tính standard deviation (contrast)
  let variance = 0;
  for (let i = 0; i < 256; i++) {
    variance += histogram[i] * Math.pow(i - mean, 2);
  }
  variance /= totalPixels;
  
  return Math.sqrt(variance);
}

/**
 * Super Resolution sử dụng Bicubic Interpolation nâng cao
 */
function applySuperResolution(imageData: ImageData, scaleFactor: number): ImageData {
  const { data, width, height } = imageData;
  const newWidth = Math.floor(width * scaleFactor);
  const newHeight = Math.floor(height * scaleFactor);
  const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
  
  // Bicubic interpolation với edge enhancement
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = x / scaleFactor;
      const srcY = y / scaleFactor;
      
      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const dx = srcX - x0;
      const dy = srcY - y0;
      
      // Lấy 16 pixel xung quanh (4x4 grid)
      const pixels: number[][] = [];
      for (let py = -1; py <= 2; py++) {
        const row: number[] = [];
        for (let px = -1; px <= 2; px++) {
          const sampleX = Math.max(0, Math.min(width - 1, x0 + px));
          const sampleY = Math.max(0, Math.min(height - 1, y0 + py));
          const idx = (sampleY * width + sampleX) * 4;
          
          row.push(data[idx]);     // R
          row.push(data[idx + 1]); // G  
          row.push(data[idx + 2]); // B
          row.push(data[idx + 3]); // A
        }
        pixels.push(row);
      }
      
      // Bicubic interpolation cho từng channel
      const newIdx = (y * newWidth + x) * 4;
      for (let channel = 0; channel < 4; channel++) {
        const channelPixels = pixels.map(row => 
          [row[channel], row[channel + 4], row[channel + 8], row[channel + 12]]
        );
        
        newData[newIdx + channel] = Math.max(0, Math.min(255, 
          bicubicInterpolate(channelPixels, dx, dy)
        ));
      }
    }
  }
  
  return new ImageData(newData, newWidth, newHeight);
}

/**
 * Bicubic interpolation function
 */
function bicubicInterpolate(pixels: number[][], dx: number, dy: number): number {
  const cubic = (t: number) => {
    const a = -0.5;
    const absT = Math.abs(t);
    if (absT <= 1) {
      return (a + 2) * Math.pow(absT, 3) - (a + 3) * Math.pow(absT, 2) + 1;
    } else if (absT <= 2) {
      return a * Math.pow(absT, 3) - 5 * a * Math.pow(absT, 2) + 8 * a * absT - 4 * a;
    }
    return 0;
  };
  
  let result = 0;
  for (let j = 0; j < 4; j++) {
    let temp = 0;
    for (let i = 0; i < 4; i++) {
      temp += pixels[j][i] * cubic(dx - i + 1);
    }
    result += temp * cubic(dy - j + 1);
  }
  
  return result;
}

/**
 * Adaptive Unsharp Masking cho ảnh độ phân giải thấp
 */
function applyAdaptiveUnsharpMask(data: Uint8ClampedArray, width: number, height: number, amount: number = 2.0) {
  const original = new Uint8ClampedArray(data);
  const blurred = new Uint8ClampedArray(data);
  
  // Tạo ảnh blur với Gaussian kernel
  const sigma = 1.0;
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = generateGaussianKernel1D(sigma, kernelSize);
  
  // Horizontal blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let weightSum = 0;
        
        for (let k = 0; k < kernelSize; k++) {
          const sampleX = x + k - Math.floor(kernelSize / 2);
          if (sampleX >= 0 && sampleX < width) {
            const idx = (y * width + sampleX) * 4 + c;
            sum += original[idx] * kernel[k];
            weightSum += kernel[k];
          }
        }
        
        const idx = (y * width + x) * 4 + c;
        blurred[idx] = sum / weightSum;
      }
    }
  }
  
  // Vertical blur
  const temp = new Uint8ClampedArray(blurred);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let weightSum = 0;
        
        for (let k = 0; k < kernelSize; k++) {
          const sampleY = y + k - Math.floor(kernelSize / 2);
          if (sampleY >= 0 && sampleY < height) {
            const idx = (sampleY * width + x) * 4 + c;
            sum += temp[idx] * kernel[k];
            weightSum += kernel[k];
          }
        }
        
        const idx = (y * width + x) * 4 + c;
        blurred[idx] = sum / weightSum;
      }
    }
  }
  
  // Apply unsharp mask với adaptive threshold
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const originalValue = original[i + c];
      const blurredValue = blurred[i + c];
      const difference = originalValue - blurredValue;
      
      // Adaptive threshold dựa trên local contrast
      const localContrast = Math.abs(difference);
      const adaptiveAmount = localContrast > 10 ? amount : amount * 0.5;
      
      const enhanced = originalValue + adaptiveAmount * difference;
      data[i + c] = Math.max(0, Math.min(255, enhanced));
    }
  }
}

/**
 * Generate 1D Gaussian kernel
 */
function generateGaussianKernel1D(sigma: number, size: number): number[] {
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
 * Edge-preserving smoothing với bilateral filter
 */
function applyEdgePreservingSmoothing(data: Uint8ClampedArray, width: number, height: number) {
  const original = new Uint8ClampedArray(data);
  const radius = 2;
  const sigmaSpace = 30;
  const sigmaColor = 30;
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const centerIdx = (y * width + x) * 4;
      
      for (let c = 0; c < 3; c++) {
        let weightSum = 0;
        let valueSum = 0;
        const centerValue = original[centerIdx + c];
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const idx = (ny * width + nx) * 4 + c;
            const value = original[idx];
            
            // Spatial weight
            const spatialDist = dx * dx + dy * dy;
            const spatialWeight = Math.exp(-spatialDist / (2 * sigmaSpace * sigmaSpace));
            
            // Color weight
            const colorDist = Math.pow(value - centerValue, 2);
            const colorWeight = Math.exp(-colorDist / (2 * sigmaColor * sigmaColor));
            
            const weight = spatialWeight * colorWeight;
            weightSum += weight;
            valueSum += value * weight;
          }
        }
        
        data[centerIdx + c] = Math.round(valueSum / weightSum);
      }
    }
  }
}

/**
 * Adaptive histogram equalization cho ảnh độ phân giải thấp
 */
function applyAdaptiveHistogramEqualization(data: Uint8ClampedArray, width: number, height: number) {
  const tileSize = Math.max(32, Math.min(64, Math.min(width, height) / 4));
  const clipLimit = 3.0;
  
  for (let tileY = 0; tileY < height; tileY += tileSize) {
    for (let tileX = 0; tileX < width; tileX += tileSize) {
      const endX = Math.min(tileX + tileSize, width);
      const endY = Math.min(tileY + tileSize, height);
      
      // Tính histogram cho tile này
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
      
      // Clip histogram
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
      
      // Tính CDF
      const cdf = new Array(256);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }
      
      // Apply equalization
      for (let y = tileY; y < endY; y++) {
        for (let x = tileX; x < endX; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          const newGray = Math.round((cdf[gray] / pixelCount) * 255);
          
          // Preserve color ratios
          const ratio = newGray / Math.max(1, gray);
          data[idx] = Math.min(255, data[idx] * ratio);
          data[idx + 1] = Math.min(255, data[idx + 1] * ratio);
          data[idx + 2] = Math.min(255, data[idx + 2] * ratio);
        }
      }
    }
  }
}

/**
 * Tiền xử lý ảnh chuyên biệt cho ảnh độ phân giải thấp
 */
async function preprocessLowResolutionImage(imageFile: File): Promise<{
  processedImageUrl: string;
  enhancementApplied: string[];
  finalQuality: 'low' | 'medium' | 'high';
}> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = async () => {
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      console.log(`📊 Original image: ${img.width}x${img.height}`);
      
      // Phân tích chất lượng ảnh
      const qualityAnalysis = await analyzeImageQuality(imageFile);
      console.log('🔍 Image quality analysis:', qualityAnalysis);
      
      const enhancementApplied: string[] = [];
      
      // Xác định scale factor dựa trên chất lượng
      let scaleFactor = 1;
      if (qualityAnalysis.quality === 'low') {
        if (qualityAnalysis.pixelDensity < 200000) {
          scaleFactor = 4; // Tăng mạnh cho ảnh rất nhỏ
        } else if (qualityAnalysis.pixelDensity < 500000) {
          scaleFactor = 3; // Tăng vừa cho ảnh nhỏ
        } else {
          scaleFactor = 2; // Tăng nhẹ
        }
        enhancementApplied.push(`Super Resolution x${scaleFactor}`);
      } else if (qualityAnalysis.quality === 'medium' && qualityAnalysis.pixelDensity < 1000000) {
        scaleFactor = 2;
        enhancementApplied.push(`Super Resolution x${scaleFactor}`);
      }
      
      // Set canvas size với scale factor
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      // High quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Apply super resolution nếu cần
      if (scaleFactor > 1) {
        // Vẽ lại với kích thước gốc trước
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const originalData = ctx.getImageData(0, 0, img.width, img.height);
        
        // Apply super resolution
        imageData = applySuperResolution(originalData, scaleFactor);
        
        // Update canvas
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
      }
      
      const data = imageData.data;
      
      // Apply enhancements dựa trên chất lượng ảnh
      if (qualityAnalysis.quality === 'low') {
        // Cho ảnh chất lượng thấp: áp dụng tất cả enhancement
        
        // 1. Edge-preserving smoothing để giảm noise
        applyEdgePreservingSmoothing(data, imageData.width, imageData.height);
        enhancementApplied.push('Edge-preserving Smoothing');
        
        // 2. Adaptive histogram equalization để cải thiện contrast
        applyAdaptiveHistogramEqualization(data, imageData.width, imageData.height);
        enhancementApplied.push('Adaptive Histogram Equalization');
        
        // 3. Adaptive unsharp masking để tăng độ sắc nét
        applyAdaptiveUnsharpMask(data, imageData.width, imageData.height, 2.5);
        enhancementApplied.push('Adaptive Unsharp Masking');
        
      } else if (qualityAnalysis.quality === 'medium') {
        // Cho ảnh chất lượng trung bình: áp dụng enhancement nhẹ
        
        if (qualityAnalysis.contrast < 50) {
          applyAdaptiveHistogramEqualization(data, imageData.width, imageData.height);
          enhancementApplied.push('Adaptive Histogram Equalization');
        }
        
        if (qualityAnalysis.sharpness < 80) {
          applyAdaptiveUnsharpMask(data, imageData.width, imageData.height, 1.5);
          enhancementApplied.push('Adaptive Unsharp Masking');
        }
      }
      
      // Final processing: Convert to high contrast B&W for better OCR
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        
        // Apply adaptive threshold
        const threshold = gray > 128 ? 255 : 0;
        
        data[i] = threshold;
        data[i + 1] = threshold;
        data[i + 2] = threshold;
      }
      enhancementApplied.push('Adaptive Thresholding');
      
      // Put processed image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Determine final quality
      const finalPixelDensity = imageData.width * imageData.height;
      let finalQuality: 'low' | 'medium' | 'high' = 'medium';
      
      if (finalPixelDensity > 2000000 && enhancementApplied.length >= 3) {
        finalQuality = 'high';
      } else if (finalPixelDensity < 500000 || enhancementApplied.length < 2) {
        finalQuality = 'low';
      }
      
      console.log(`✅ Enhanced image: ${imageData.width}x${imageData.height}, Quality: ${finalQuality}`);
      console.log('🔧 Enhancements applied:', enhancementApplied);
      
      // Convert to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({
            processedImageUrl: URL.createObjectURL(blob),
            enhancementApplied,
            finalQuality
          });
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}/**

 * Multi-pass OCR cho ảnh độ phân giải thấp
 */
async function performMultiPassOCR(processedImageUrl: string, onProgress?: (progress: OCRProgress) => void): Promise<{
  text: string;
  confidence: number;
  bestPass: string;
}> {
  const ocrPasses = [
    {
      name: 'Standard',
      config: {
        lang: 'eng+vie',
        options: {
          tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
          tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine only
        }
      }
    },
    {
      name: 'Single Block',
      config: {
        lang: 'eng+vie',
        options: {
          tessedit_pageseg_mode: '6', // Uniform block of text
          tessedit_ocr_engine_mode: '1',
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:/- '
        }
      }
    },
    {
      name: 'Single Line',
      config: {
        lang: 'eng+vie',
        options: {
          tessedit_pageseg_mode: '7', // Single text line
          tessedit_ocr_engine_mode: '1',
          preserve_interword_spaces: '1'
        }
      }
    },
    {
      name: 'Raw Line',
      config: {
        lang: 'eng+vie',
        options: {
          tessedit_pageseg_mode: '13', // Raw line. Treat the image as a single text line
          tessedit_ocr_engine_mode: '1'
        }
      }
    }
  ];

  const results: Array<{ text: string; confidence: number; pass: string }> = [];
  
  for (let i = 0; i < ocrPasses.length; i++) {
    const pass = ocrPasses[i];
    
    try {
      onProgress?.({ 
        status: `Đang thử OCR pass ${i + 1}/${ocrPasses.length}: ${pass.name}...`, 
        progress: 0.2 + (i / ocrPasses.length) * 0.6 
      });
      
      const result = await Tesseract.recognize(
        processedImageUrl,
        pass.config.lang,
        {
          logger: (m) => {
            if (onProgress && m.progress) {
              const baseProgress = 0.2 + (i / ocrPasses.length) * 0.6;
              const passProgress = (m.progress * 0.6) / ocrPasses.length;
              onProgress({
                status: `${pass.name}: ${m.status}`,
                progress: baseProgress + passProgress
              });
            }
          },
          ...pass.config.options
        }
      );
      
      const confidence = result.data.confidence || 0;
      const text = result.data.text || '';
      
      if (text.trim().length > 0) {
        results.push({
          text: text.trim(),
          confidence,
          pass: pass.name
        });
        
        console.log(`📝 OCR Pass ${pass.name}: confidence=${confidence}%, length=${text.length}`);
      }
      
    } catch (error) {
      console.warn(`⚠️ OCR Pass ${pass.name} failed:`, error);
    }
  }
  
  if (results.length === 0) {
    throw new Error('Tất cả OCR passes đều thất bại');
  }
  
  // Chọn kết quả tốt nhất dựa trên confidence và độ dài text
  results.sort((a, b) => {
    const scoreA = a.confidence + (a.text.length > 50 ? 10 : 0);
    const scoreB = b.confidence + (b.text.length > 50 ? 10 : 0);
    return scoreB - scoreA;
  });
  
  const best = results[0];
  console.log(`🏆 Best OCR result: ${best.pass} (confidence: ${best.confidence}%)`);
  
  return {
    text: best.text,
    confidence: best.confidence,
    bestPass: best.pass
  };
}

/**
 * Post-processing text với AI correction cho ảnh độ phân giải thấp
 */
function postProcessLowResText(text: string): string {
  let processed = text;
  
  // Aggressive OCR error correction cho ảnh độ phân giải thấp
  const corrections = [
    // Character-level corrections
    [/[|]/g, 'I'],
    [/[0O]/g, 'O'],
    [/[5S]/g, 'S'],
    [/[1Il]/g, 'I'],
    [/rn/g, 'm'],
    [/vv/g, 'w'],
    [/cl/g, 'd'],
    [/[8B]/g, 'B'],
    [/[6G]/g, 'G'],
    [/[2Z]/g, 'Z'],
    
    // Word-level corrections
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
    [/\bCandidate\b/gi, 'Candidate'],
    [/\bFamily\b/gi, 'Family'],
    [/\bFirst\b/gi, 'First'],
    [/\bBand\b/gi, 'Band'],
    [/\bScore\b/gi, 'Score'],
    [/\bTest\b/gi, 'Test'],
    [/\bReport\b/gi, 'Report'],
    [/\bIELTS\b/gi, 'IELTS'],
    [/\bTOEIC\b/gi, 'TOEIC'],
    [/\bTOEFL\b/gi, 'TOEFL'],
    [/\bVSTEP\b/gi, 'VSTEP'],
    
    // Punctuation corrections
    [/\s*:\s*/g, ': '],
    [/\s*\|\s*/g, ' | '],
    [/(\d+)\s*[.,]\s*(\d+)/g, '$1.$2'],
    [/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g, '$1/$2/$3'],
    
    // Space normalization
    [/\s+/g, ' '],
    [/^\s+|\s+$/g, '']
  ];
  
  for (const [pattern, replacement] of corrections) {
    processed = processed.replace(pattern, replacement as string);
  }
  
  return processed;
}

/**
 * Enhanced information extraction cho ảnh độ phân giải thấp
 */
function extractInformationFromLowResText(text: string, imageQuality: 'low' | 'medium' | 'high'): Partial<ExtractedData> {
  const cleanText = postProcessLowResText(text);
  console.log('🧹 Post-processed text:', cleanText);
  
  const data: Partial<ExtractedData> = {
    rawText: text,
    confidence: 0,
    imageQuality,
    enhancementApplied: []
  };
  
  // Confidence penalty cho ảnh chất lượng thấp
  const qualityPenalty = imageQuality === 'low' ? 0.7 : imageQuality === 'medium' ? 0.85 : 1.0;
  
  // Certificate type detection với fuzzy matching
  data.certificateType = detectCertificateTypeFuzzy(cleanText);
  if (data.certificateType) {
    data.confidence = (data.confidence || 0) + 15 * qualityPenalty;
  }
  
  // Name extraction với multiple strategies
  data.fullName = extractNameMultiStrategy(cleanText);
  if (data.fullName) {
    data.confidence = (data.confidence || 0) + 25 * qualityPenalty;
  }
  
  // Date extraction với context awareness
  const dates = extractDatesWithContext(cleanText);
  data.dateOfBirth = dates.dateOfBirth;
  data.examDate = dates.examDate;
  data.issueDate = dates.issueDate;
  if (dates.dateOfBirth) data.confidence = (data.confidence || 0) + 15 * qualityPenalty;
  if (dates.examDate) data.confidence = (data.confidence || 0) + 10 * qualityPenalty;
  
  // Certificate number với pattern matching
  data.certificateNumber = extractCertificateNumberPattern(cleanText, data.certificateType);
  if (data.certificateNumber) {
    data.confidence = (data.confidence || 0) + 20 * qualityPenalty;
  }
  
  // Score extraction với validation
  data.scores = extractScoresWithValidation(cleanText, data.certificateType);
  const scoreCount = Object.keys(data.scores || {}).length;
  data.confidence = (data.confidence || 0) + scoreCount * 5 * qualityPenalty;
  
  // Organization detection
  data.issuingOrganization = detectOrganization(cleanText, data.certificateType);
  if (data.issuingOrganization) {
    data.confidence = (data.confidence || 0) + 10 * qualityPenalty;
  }
  
  console.log(`📊 Low-res extraction confidence: ${data.confidence}%`);
  return data;
}

/**
 * Fuzzy certificate type detection
 */
function detectCertificateTypeFuzzy(text: string): string {
  const patterns = [
    { type: 'IELTS', keywords: ['ielts', 'international english', 'test report form', 'band score'], threshold: 0.6 },
    { type: 'TOEFL', keywords: ['toefl', 'test of english', 'foreign language', 'ets'], threshold: 0.6 },
    { type: 'TOEIC', keywords: ['toeic', 'international communication', 'listening reading'], threshold: 0.6 },
    { type: 'VSTEP', keywords: ['vstep', 'vietnamese standardized', 'bộ giáo dục'], threshold: 0.5 }
  ];
  
  const lowerText = text.toLowerCase();
  
  for (const { type, keywords, threshold } of patterns) {
    let matches = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword) || fuzzyMatch(lowerText, keyword, 0.8)) {
        matches++;
      }
    }
    
    const score = matches / keywords.length;
    if (score >= threshold) {
      console.log(`🎯 Certificate type detected: ${type} (score: ${score})`);
      return type;
    }
  }
  
  return '';
}

/**
 * Fuzzy string matching
 */
function fuzzyMatch(text: string, pattern: string, threshold: number): boolean {
  const distance = levenshteinDistance(text, pattern);
  const maxLength = Math.max(text.length, pattern.length);
  const similarity = 1 - distance / maxLength;
  return similarity >= threshold;
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Multi-strategy name extraction
 */
function extractNameMultiStrategy(text: string): string {
  const strategies = [
    // Strategy 1: IELTS specific
    {
      pattern: /Family\s+Name[:\s]*([A-Z]+)\s+First\s+Name[:\s]*([A-Z\s]+)/i,
      extractor: (match: RegExpMatchArray) => `${match[2].trim()} ${match[1].trim()}`,
      confidence: 0.9
    },
    
    // Strategy 2: General candidate name
    {
      pattern: /(?:Candidate\s+)?Name[:\s]*([A-Z][A-Za-z\s]{3,40})/i,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 0.8
    },
    
    // Strategy 3: Context-based
    {
      pattern: /([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s+(?:Date|DOB|Form)/i,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 0.7
    },
    
    // Strategy 4: Loose pattern
    {
      pattern: /\b([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/,
      extractor: (match: RegExpMatchArray) => match[1].trim(),
      confidence: 0.5
    }
  ];
  
  const candidates: Array<{ name: string; confidence: number }> = [];
  
  for (const strategy of strategies) {
    const match = text.match(strategy.pattern);
    if (match) {
      try {
        const name = strategy.extractor(match);
        if (validateNameQuality(name) > 0) {
          candidates.push({
            name,
            confidence: strategy.confidence
          });
        }
      } catch (error) {
        console.warn('Name extraction error:', error);
      }
    }
  }
  
  if (candidates.length === 0) return '';
  
  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);
  return candidates[0].name;
}

/**
 * Validate name quality
 */
function validateNameQuality(name: string): number {
  if (!name || name.length < 3) return 0;
  
  const words = name.split(/\s+/).filter(word => word.length > 0);
  let score = 0;
  
  // Check word count
  if (words.length >= 2 && words.length <= 4) score += 20;
  else if (words.length === 1) score += 5;
  else return 0;
  
  // Check word lengths
  const validWords = words.filter(word => word.length >= 2 && word.length <= 15);
  if (validWords.length === words.length) score += 15;
  
  // Check character composition
  const hasOnlyLetters = /^[A-Za-z\s]+$/.test(name);
  if (hasOnlyLetters) score += 15;
  
  // Check capitalization
  const isProperlyCapitalized = words.every(word => /^[A-Z][a-z]*$/.test(word));
  if (isProperlyCapitalized) score += 10;
  
  // Penalize OCR errors
  if (/\d/.test(name)) score -= 20;
  if (/[|_]/.test(name)) score -= 15;
  if (name.length > 50) score -= 10;
  
  return Math.max(0, score);
}

/**
 * Extract dates với context awareness
 */
function extractDatesWithContext(text: string): { 
  dateOfBirth?: string; 
  examDate?: string; 
  issueDate?: string; 
} {
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/gi,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g
  ];
  
  const contextKeywords = {
    dateOfBirth: ['date of birth', 'dob', 'birth', 'ngày sinh'],
    examDate: ['date', 'test date', 'exam', 'ngày thi'],
    issueDate: ['issue', 'issued', 'ngày cấp']
  };
  
  const foundDates: Array<{ date: string; context: string }> = [];
  
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const date = match[1];
      const startPos = match.index;
      const contextStart = Math.max(0, startPos - 30);
      const contextEnd = Math.min(text.length, startPos + date.length + 30);
      const context = text.substring(contextStart, contextEnd).toLowerCase();
      
      foundDates.push({ date, context });
    }
  }
  
  const result: { dateOfBirth?: string; examDate?: string; issueDate?: string } = {};
  
  for (const { date, context } of foundDates) {
    let bestMatch = { type: '', score: 0 };
    
    for (const [dateType, keywords] of Object.entries(contextKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (context.includes(keyword)) {
          score += keyword.length;
        }
      }
      
      if (score > bestMatch.score) {
        bestMatch = { type: dateType, score };
      }
    }
    
    if (bestMatch.score > 0) {
      (result as any)[bestMatch.type] = date;
    } else if (!result.examDate) {
      result.examDate = date;
    }
  }
  
  return result;
}

/**
 * Extract certificate number với pattern matching
 */
function extractCertificateNumberPattern(text: string, certificateType?: string): string {
  const patterns = [
    // IELTS specific
    /Form\s+Number[:\s]*([A-Z0-9]{6,20})/i,
    
    // General patterns
    /(?:Certificate|Cert)\s+(?:Number|No)[:\s]*([A-Z0-9\-]{6,20})/i,
    /(?:Registration|Reg)\s+(?:Number|No)[:\s]*([A-Z0-9\-]{6,20})/i,
    /Candidate\s+Number[:\s]*(\d{6,15})/i,
    
    // Pattern-based
    /\b([A-Z]{2,4}\d{6,12}[A-Z0-9]*)\b/,
    /\b(\d{2}[A-Z]{2}\d{6}[A-Z0-9]+)\b/,
    /\b([A-Z0-9]{8,20})\b/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const certNum = match[1].trim();
      if (validateCertificateNumber(certNum, certificateType)) {
        return certNum;
      }
    }
  }
  
  return '';
}

/**
 * Validate certificate number
 */
function validateCertificateNumber(certNum: string, certificateType?: string): boolean {
  if (certNum.length < 4 || certNum.length > 25) return false;
  
  switch (certificateType) {
    case 'IELTS':
      return /^[A-Z0-9]{6,20}$/.test(certNum);
    case 'TOEIC':
    case 'TOEFL':
    case 'VSTEP':
      return /^[A-Z0-9\-]{6,20}$/.test(certNum);
    default:
      return /^[A-Z0-9\-]{4,25}$/.test(certNum);
  }
}

/**
 * Extract scores với validation
 */
function extractScoresWithValidation(text: string, certificateType?: string): any {
  switch (certificateType) {
    case 'IELTS':
      return extractIELTSScores(text);
    case 'TOEIC':
      return extractTOEICScores(text);
    case 'TOEFL':
      return extractTOEFLScores(text);
    case 'VSTEP':
      return extractVSTEPScores(text);
    default:
      return extractGenericScores(text);
  }
}

/**
 * Extract IELTS scores
 */
function extractIELTSScores(text: string): any {
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
        break;
      }
    }
  }
  
  return scores;
}

/**
 * Extract TOEIC scores
 */
function extractTOEICScores(text: string): any {
  const scores: any = {};
  
  const patterns = [
    { skill: 'total', pattern: /Total\s+Score[:\s]*(\d{3,4})/i, range: [10, 990] },
    { skill: 'listening', pattern: /Listening[:\s]*(\d{2,3})/i, range: [5, 495] },
    { skill: 'reading', pattern: /Reading[:\s]*(\d{2,3})/i, range: [5, 495] }
  ];
  
  for (const { skill, pattern, range } of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= range[0] && score <= range[1]) {
        scores[skill] = score;
      }
    }
  }
  
  return scores;
}

/**
 * Extract TOEFL scores
 */
function extractTOEFLScores(text: string): any {
  const scores: any = {};
  
  const skillPatterns = ['reading', 'listening', 'speaking', 'writing'];
  
  for (const skill of skillPatterns) {
    const pattern = new RegExp(`${skill}[:\\s]*(\\d{1,2})`, 'i');
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
      scores.total = score;
    }
  }
  
  return scores;
}

/**
 * Extract VSTEP scores
 */
function extractVSTEPScores(text: string): any {
  const scores: any = {};
  
  const skillPatterns = ['listening', 'reading', 'writing', 'speaking'];
  
  for (const skill of skillPatterns) {
    const pattern = new RegExp(`${skill}[:\\s]*(\\d+\\.?\\d*)`, 'i');
    const match = text.match(pattern);
    if (match) {
      const score = parseFloat(match[1]);
      if (score >= 0 && score <= 10) {
        scores[skill] = score;
      }
    }
  }
  
  // Overall
  const overallPattern = /Overall[:\s]*(\d+\.?\d*)/i;
  const overallMatch = text.match(overallPattern);
  if (overallMatch) {
    const score = parseFloat(overallMatch[1]);
    if (score >= 0 && score <= 10) {
      scores.overall = score;
    }
  }
  
  return scores;
}

/**
 * Extract generic scores
 */
function extractGenericScores(text: string): any {
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

/**
 * Detect organization
 */
function detectOrganization(text: string, certificateType?: string): string {
  const orgMap: Record<string, string[]> = {
    'IELTS': ['British Council', 'IDP', 'Cambridge'],
    'TOEFL': ['ETS', 'Educational Testing Service'],
    'TOEIC': ['ETS', 'Educational Testing Service'],
    'VSTEP': ['Bộ Giáo dục và Đào tạo', 'Ministry of Education']
  };
  
  if (certificateType && orgMap[certificateType]) {
    for (const org of orgMap[certificateType]) {
      if (text.toLowerCase().includes(org.toLowerCase())) {
        return org;
      }
    }
    return orgMap[certificateType][0];
  }
  
  return '';
}

/**
 * Main function: Xử lý ảnh độ phân giải thấp với OCR nâng cao
 */
export async function processLowResolutionImage(
  imageFile: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<ExtractedData> {
  console.log('🚀 Starting low-resolution image processing...');
  
  try {
    // Bước 1: Tiền xử lý ảnh với enhancement
    onProgress?.({ status: 'Đang phân tích và cải thiện chất lượng ảnh...', progress: 0.1 });
    
    const { processedImageUrl, enhancementApplied, finalQuality } = await preprocessLowResolutionImage(imageFile);
    
    // Bước 2: Multi-pass OCR
    onProgress?.({ status: 'Đang thực hiện OCR đa lượt...', progress: 0.2 });
    
    const ocrResult = await performMultiPassOCR(processedImageUrl, onProgress);
    
    // Bước 3: Extract information
    onProgress?.({ status: 'Đang trích xuất thông tin...', progress: 0.8 });
    
    const extractedData = extractInformationFromLowResText(ocrResult.text, finalQuality);
    
    // Bước 4: Finalize result
    onProgress?.({ status: 'Hoàn thành xử lý', progress: 1.0 });
    
    const finalResult: ExtractedData = {
      fullName: extractedData.fullName || '',
      dateOfBirth: extractedData.dateOfBirth || '',
      certificateNumber: extractedData.certificateNumber || '',
      examDate: extractedData.examDate || '',
      issueDate: extractedData.issueDate || '',
      issuingOrganization: extractedData.issuingOrganization || '',
      scores: extractedData.scores || {},
      certificateType: extractedData.certificateType || '',
      rawText: extractedData.rawText || '',
      confidence: Math.min(95, (extractedData.confidence || 0) + (ocrResult.confidence * 0.3)),
      imageQuality: finalQuality,
      enhancementApplied: enhancementApplied
    };
    
    // Clean up
    URL.revokeObjectURL(processedImageUrl);
    
    console.log('✅ Low-resolution processing completed:', {
      imageQuality: finalQuality,
      enhancementApplied,
      confidence: finalResult.confidence,
      bestOCRPass: ocrResult.bestPass
    });
    
    return finalResult;
    
  } catch (error) {
    console.error('❌ Low-resolution processing error:', error);
    throw new Error('Không thể xử lý ảnh độ phân giải thấp');
  }
}

/**
 * Test function với mock low-res image
 */
export function testLowResProcessing() {
  console.log('🧪 Testing low-resolution processing...');
  
  const mockLowResText = `
    IELTS Test Report
    Candidate: NGUYEN VAN A
    DOB: 15/03/1995
    Form: IELTS2023ABC
    Date: 12/10/2023
    
    L: 8.0
    R: 7.0
    W: 7.0
    S: 8.0
    Band: 7.5
  `;
  
  const result = extractInformationFromLowResText(mockLowResText, 'low');
  console.log('✅ Test result:', result);
  return result;
}