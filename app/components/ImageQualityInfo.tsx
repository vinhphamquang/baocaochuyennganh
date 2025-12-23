'use client';

import React from 'react';
import { 
  PhotoIcon, 
  SparklesIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ImageQualityInfoProps {
  imageQuality?: 'low' | 'medium' | 'high';
  enhancementApplied?: string[];
  confidence?: number;
  className?: string;
}

export default function ImageQualityInfo({ 
  imageQuality, 
  enhancementApplied = [], 
  confidence,
  className = '' 
}: ImageQualityInfoProps) {
  if (!imageQuality) return null;

  const getQualityConfig = (quality: string) => {
    switch (quality) {
      case 'high':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircleIcon,
          label: 'Chất lượng cao',
          description: 'Ảnh có độ phân giải và độ rõ nét tốt'
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: InformationCircleIcon,
          label: 'Chất lượng trung bình',
          description: 'Ảnh có thể được cải thiện để tăng độ chính xác'
        };
      case 'low':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: ExclamationTriangleIcon,
          label: 'Chất lượng thấp',
          description: 'Đã áp dụng các kỹ thuật AI để cải thiện'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: PhotoIcon,
          label: 'Không xác định',
          description: ''
        };
    }
  };

  const getConfidenceConfig = (conf: number) => {
    if (conf >= 80) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Rất tin cậy'
      };
    } else if (conf >= 60) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Tin cậy'
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Cần kiểm tra'
      };
    }
  };

  const qualityConfig = getQualityConfig(imageQuality);
  const confidenceConfig = confidence ? getConfidenceConfig(confidence) : null;
  const QualityIcon = qualityConfig.icon;

  return (
    <div className={`rounded-lg border ${qualityConfig.borderColor} ${qualityConfig.bgColor} p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <QualityIcon className={`h-6 w-6 ${qualityConfig.color} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-semibold ${qualityConfig.color}`}>
              📊 Phân tích chất lượng ảnh
            </h3>
            
            {confidence !== undefined && confidenceConfig && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${confidenceConfig.bgColor} ${confidenceConfig.color}`}>
                {confidence}% - {confidenceConfig.label}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quality Status */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${qualityConfig.bgColor} ${qualityConfig.color} border ${qualityConfig.borderColor}`}>
                  {qualityConfig.label}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {qualityConfig.description}
              </p>
            </div>
            
            {/* Enhancement Applied */}
            {enhancementApplied.length > 0 && (
              <div>
                <div className="flex items-center space-x-1 mb-2">
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Cải thiện đã áp dụng ({enhancementApplied.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {enhancementApplied.slice(0, 3).map((enhancement, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                      title={enhancement}
                    >
                      {enhancement.length > 15 ? `${enhancement.substring(0, 15)}...` : enhancement}
                    </span>
                  ))}
                  {enhancementApplied.length > 3 && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                      +{enhancementApplied.length - 3} khác
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Detailed Enhancement List (Collapsible) */}
          {enhancementApplied.length > 3 && (
            <details className="mt-3">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                Xem tất cả kỹ thuật cải thiện
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-blue-200">
                <div className="grid grid-cols-1 gap-1">
                  {enhancementApplied.map((enhancement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                      <span className="text-xs text-gray-700">{enhancement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}
          
          {/* Tips based on quality */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              {imageQuality === 'low' && (
                <div className="flex items-start space-x-1">
                  <InformationCircleIcon className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mẹo:</strong> Hệ thống đã tự động cải thiện ảnh của bạn. 
                    Để có kết quả tốt hơn, hãy sử dụng ảnh có độ phân giải cao hơn (tối thiểu 800x600px).
                  </span>
                </div>
              )}
              
              {imageQuality === 'medium' && (
                <div className="flex items-start space-x-1">
                  <InformationCircleIcon className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Mẹo:</strong> Chất lượng ảnh khá tốt. 
                    Đảm bảo ảnh có ánh sáng đều và không bị mờ để tăng độ chính xác.
                  </span>
                </div>
              )}
              
              {imageQuality === 'high' && (
                <div className="flex items-start space-x-1">
                  <CheckCircleIcon className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Tuyệt vời!</strong> Ảnh có chất lượng cao, 
                    hệ thống có thể nhận dạng chính xác thông tin chứng chỉ.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}