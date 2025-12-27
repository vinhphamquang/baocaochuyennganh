'use client';

import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  DocumentTextIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface OCRDebugInfoProps {
  rawText: string;
  confidence?: number;
  extractionMethod?: string;
  processingTime?: number;
  className?: string;
}

export default function OCRDebugInfo({ 
  rawText, 
  confidence, 
  extractionMethod,
  processingTime,
  className = '' 
}: OCRDebugInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!rawText) return null;

  const textStats = {
    length: rawText.length,
    lines: rawText.split('\n').length,
    words: rawText.split(/\s+/).filter(word => word.length > 0).length,
    hasNumbers: /\d/.test(rawText),
    hasUppercase: /[A-Z]/.test(rawText),
    hasSpecialChars: /[^\w\s]/.test(rawText)
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Thông tin debug OCR
          </span>
          {confidence !== undefined && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              confidence >= 60 ? 'bg-green-100 text-green-800' :
              confidence >= 40 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {confidence}%
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-3">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{textStats.length}</div>
              <div className="text-xs text-gray-500">Ký tự</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{textStats.words}</div>
              <div className="text-xs text-gray-500">Từ</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{textStats.lines}</div>
              <div className="text-xs text-gray-500">Dòng</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {extractionMethod || 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Phương pháp</div>
            </div>
          </div>

          {/* Processing Info */}
          {(processingTime || confidence !== undefined) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-1 mb-2">
                <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-800">Thông tin xử lý</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {confidence !== undefined && (
                  <div>
                    <span className="text-blue-600">Độ tin cậy:</span>
                    <span className="ml-2 font-medium">{confidence}%</span>
                  </div>
                )}
                {processingTime && (
                  <div>
                    <span className="text-blue-600">Thời gian:</span>
                    <span className="ml-2 font-medium">{processingTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Quality Indicators */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Chất lượng văn bản:</div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                textStats.hasNumbers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {textStats.hasNumbers ? '✓' : '✗'} Có số
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                textStats.hasUppercase ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {textStats.hasUppercase ? '✓' : '✗'} Có chữ hoa
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                textStats.words > 10 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {textStats.words > 10 ? '✓' : '⚠'} Đủ từ ({textStats.words})
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                textStats.length > 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {textStats.length > 50 ? '✓' : '✗'} Đủ dài ({textStats.length})
              </span>
            </div>
          </div>

          {/* Raw Text */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Văn bản gốc từ OCR:</div>
            <div className="bg-white border rounded-lg p-3 max-h-60 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {rawText || 'Không có văn bản được trích xuất'}
              </pre>
            </div>
          </div>

          {/* Suggestions */}
          {textStats.length < 50 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">OCR trích xuất được ít văn bản</div>
                  <div className="text-xs">
                    Gợi ý: Thử ảnh rõ nét hơn, ánh sáng tốt hơn, hoặc chụp thẳng góc
                  </div>
                </div>
              </div>
            </div>
          )}

          {!textStats.hasNumbers && !textStats.hasUppercase && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <div className="font-medium mb-1">Văn bản có vẻ không chính xác</div>
                  <div className="text-xs">
                    Chứng chỉ thường có số và chữ hoa. Hãy thử ảnh chất lượng cao hơn.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}