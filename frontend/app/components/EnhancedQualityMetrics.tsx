'use client'

import { useState } from 'react'
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface EnhancedQualityMetricsProps {
  confidence: number;
  extractionMethod: 'tesseract' | 'ai-api' | 'hybrid';
  processingTime?: number;
  imageQuality?: {
    resolution: string;
    clarity: number;
    contrast: number;
  };
  ocrStats?: {
    charactersRecognized: number;
    wordsRecognized: number;
    linesRecognized: number;
  };
  validationResult?: {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  };
  fieldsExtracted?: number;
  totalFields?: number;
}

export default function EnhancedQualityMetrics({ 
  confidence, 
  extractionMethod, 
  processingTime,
  imageQuality,
  ocrStats,
  validationResult,
  fieldsExtracted = 0,
  totalFields = 8
}: EnhancedQualityMetricsProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getMethodInfo = () => {
    switch (extractionMethod) {
      case 'ai-api':
        return {
          name: 'Gemini AI',
          icon: '🤖',
          color: 'from-blue-500 to-blue-600',
          description: 'Google Gemini 1.5 Pro'
        };
      case 'hybrid':
        return {
          name: 'Hybrid AI+OCR',
          icon: '🔀',
          color: 'from-purple-500 to-purple-600',
          description: 'Gemini AI + Tesseract OCR'
        };
      default:
        return {
          name: 'Tesseract OCR',
          icon: '🔍',
          color: 'from-green-500 to-green-600',
          description: 'Advanced OCR Engine'
        };
    }
  };

  const getConfidenceLevel = () => {
    if (confidence >= 90) return { level: 'Xuất sắc', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (confidence >= 80) return { level: 'Tốt', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (confidence >= 70) return { level: 'Khá', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (confidence >= 60) return { level: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (confidence >= 40) return { level: 'Yếu', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { level: 'Kém', color: 'text-red-600', bgColor: 'bg-red-100' }
  }

  const completionRate = (fieldsExtracted / totalFields) * 100;
  const methodInfo = getMethodInfo();
  const confidenceInfo = getConfidenceLevel();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Chất lượng trích xuất
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          {showDetails ? (
            <ChevronUpIcon className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Confidence Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${confidenceInfo.bgColor} mb-2`}>
            <span className={`text-2xl font-bold ${confidenceInfo.color}`}>
              {Math.round(confidence)}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900">{confidenceInfo.level}</div>
          <div className="text-xs text-gray-500">Độ tin cậy</div>
        </div>

        {/* Completion Rate */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-2">
            <span className="text-xl font-bold text-indigo-600">
              {Math.round(completionRate)}%
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900">{fieldsExtracted}/{totalFields} trường</div>
          <div className="text-xs text-gray-500">Tỷ lệ hoàn thành</div>
        </div>

        {/* Extraction Method */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${methodInfo.color} mb-2 shadow-md`}>
            <span className="text-2xl">{methodInfo.icon}</span>
          </div>
          <div className="text-sm font-medium text-gray-900">{methodInfo.name}</div>
          <div className="text-xs text-gray-500">{methodInfo.description}</div>
        </div>

        {/* Processing Time */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
            <ClockIcon className="h-8 w-8 text-gray-600" />
          </div>
          <div className="text-sm font-medium text-gray-900">
            {processingTime ? `${processingTime.toFixed(1)}s` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Thời gian xử lý</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        {/* Confidence Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Độ tin cậy</span>
            <span>{Math.round(confidence)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                confidence >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                confidence >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${Math.min(100, confidence)}%` }}
            />
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tỷ lệ hoàn thành</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                completionRate >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 
                completionRate >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                'bg-gradient-to-r from-red-400 to-red-500'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {validationResult && (
        <div className="mb-4">
          <div className={`flex items-center p-3 rounded-lg ${
            validationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {validationResult.isValid ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {validationResult.isValid ? 'Dữ liệu hợp lệ' : 'Cần kiểm tra dữ liệu'}
              </div>
              <div className="text-xs text-gray-600">
                {validationResult.errors.length > 0 && `${validationResult.errors.length} lỗi, `}
                {validationResult.suggestions.length > 0 && `${validationResult.suggestions.length} đề xuất`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Image Quality */}
          {imageQuality && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <EyeIcon className="h-4 w-4 mr-2" />
                Chất lượng ảnh
              </h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{imageQuality.resolution}</div>
                  <div className="text-xs text-gray-500">Độ phân giải</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{imageQuality.clarity}%</div>
                  <div className="text-xs text-gray-500">Độ rõ nét</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{imageQuality.contrast}%</div>
                  <div className="text-xs text-gray-500">Độ tương phản</div>
                </div>
              </div>
            </div>
          )}

          {/* OCR Statistics */}
          {ocrStats && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <CpuChipIcon className="h-4 w-4 mr-2" />
                Thống kê OCR
              </h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{ocrStats.charactersRecognized}</div>
                  <div className="text-xs text-gray-500">Ký tự</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{ocrStats.wordsRecognized}</div>
                  <div className="text-xs text-gray-500">Từ</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-medium text-gray-900">{ocrStats.linesRecognized}</div>
                  <div className="text-xs text-gray-500">Dòng</div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              Mẹo cải thiện chất lượng
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              {confidence < 70 && (
                <>
                  <li>• Sử dụng ảnh có độ phân giải cao hơn (tối thiểu 1200x900)</li>
                  <li>• Đảm bảo ánh sáng đều, tránh bóng đổ</li>
                  <li>• Chụp thẳng góc, không bị nghiêng</li>
                </>
              )}
              {extractionMethod === 'tesseract' && (
                <li>• Thử với ảnh có độ tương phản cao hơn</li>
              )}
              {completionRate < 80 && (
                <li>• Đảm bảo toàn bộ chứng chỉ nằm trong khung ảnh</li>
              )}
              <li>• Sử dụng file PDF gốc nếu có thể để đạt kết quả tốt nhất</li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Recommendations */}
      <div className="mt-4 space-y-2">
        {confidence < 70 && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-600">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Độ tin cậy thấp</p>
              <p className="text-xs text-yellow-700">
                Vui lòng kiểm tra và chỉnh sửa thông tin. Thử upload ảnh chất lượng cao hơn.
              </p>
            </div>
          </div>
        )}
        
        {completionRate < 60 && (
          <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-orange-600">📝</span>
            <div>
              <p className="text-sm font-semibold text-orange-800">Thiếu thông tin</p>
              <p className="text-xs text-orange-700">
                Một số trường thông tin chưa được trích xuất. Bạn có thể nhập thủ công.
              </p>
            </div>
          </div>
        )}

        {confidence >= 80 && completionRate >= 80 && (
          <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600">✅</span>
            <div>
              <p className="text-sm font-semibold text-green-800">Trích xuất thành công</p>
              <p className="text-xs text-green-700">
                Thông tin đã được trích xuất với chất lượng cao. Bạn có thể lưu hoặc xuất dữ liệu.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}