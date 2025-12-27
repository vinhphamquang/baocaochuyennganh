'use client'

import { useState } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  suggestions: string[];
  correctedData?: any;
}

interface ValidationResultsProps {
  validationResult: ValidationResult;
  onApplyCorrections?: (correctedData: any) => void;
}

export default function ValidationResults({ validationResult, onApplyCorrections }: ValidationResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCorrections, setShowCorrections] = useState(false)

  if (!validationResult) return null

  const { isValid, confidence, errors, suggestions, correctedData } = validationResult
  const hasCorrections = correctedData && Object.keys(correctedData).length > 0

  const getStatusColor = () => {
    if (isValid && confidence >= 80) return 'green'
    if (confidence >= 60) return 'yellow'
    return 'red'
  }

  const getStatusIcon = () => {
    const color = getStatusColor()
    if (color === 'green') return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    if (color === 'yellow') return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
  }

  const getStatusText = () => {
    if (isValid && confidence >= 80) return 'Dữ liệu chất lượng cao'
    if (isValid && confidence >= 60) return 'Dữ liệu hợp lệ'
    if (confidence >= 40) return 'Dữ liệu cần kiểm tra'
    return 'Dữ liệu có vấn đề'
  }

  const getStatusBgColor = () => {
    const color = getStatusColor()
    if (color === 'green') return 'bg-green-50 border-green-200'
    if (color === 'yellow') return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className={`rounded-xl border-2 ${getStatusBgColor()} p-4 mb-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-bold text-gray-900">{getStatusText()}</h3>
            <p className="text-sm text-gray-600">
              Độ tin cậy: {Math.round(confidence)}% | 
              {errors.length > 0 && ` ${errors.length} lỗi`}
              {suggestions.length > 0 && ` ${suggestions.length} đề xuất`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasCorrections && (
            <button
              onClick={() => setShowCorrections(!showCorrections)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              AI Corrections
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              confidence >= 80 ? 'bg-green-500' : 
              confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, confidence)}%` }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Vấn đề cần khắc phục ({errors.length})
              </h4>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <InformationCircleIcon className="h-4 w-4 mr-2" />
                Đề xuất cải thiện ({suggestions.length})
              </h4>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Corrections Panel */}
      {showCorrections && hasCorrections && (
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-purple-800 flex items-center">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI đề xuất sửa đổi
            </h4>
            {onApplyCorrections && (
              <button
                onClick={() => onApplyCorrections(correctedData)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Áp dụng tất cả
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {Object.entries(correctedData).map(([field, value]) => (
              <div key={field} className="flex items-center justify-between text-sm">
                <span className="text-purple-700 font-medium capitalize">
                  {field.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span className="text-purple-900 font-mono bg-purple-100 px-2 py-1 rounded">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-2 border">
          <div className="text-lg font-bold text-gray-900">{Math.round(confidence)}%</div>
          <div className="text-xs text-gray-600">Độ tin cậy</div>
        </div>
        <div className="bg-white rounded-lg p-2 border">
          <div className="text-lg font-bold text-red-600">{errors.length}</div>
          <div className="text-xs text-gray-600">Lỗi</div>
        </div>
        <div className="bg-white rounded-lg p-2 border">
          <div className="text-lg font-bold text-blue-600">{suggestions.length}</div>
          <div className="text-xs text-gray-600">Đề xuất</div>
        </div>
      </div>
    </div>
  )
}