'use client'

interface QualityMetricsProps {
  confidence: number
  extractionMethod: 'tesseract' | 'ai-api' | 'hybrid'
  fieldsExtracted: number
  totalFields: number
  processingTime?: number
}

export default function QualityMetrics({ 
  confidence, 
  extractionMethod, 
  fieldsExtracted, 
  totalFields,
  processingTime 
}: QualityMetricsProps) {
  const completionRate = (fieldsExtracted / totalFields) * 100
  
  const getQualityLevel = (score: number) => {
    if (score >= 90) return { level: 'Xuất sắc', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
    if (score >= 80) return { level: 'Tốt', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
    if (score >= 70) return { level: 'Khá', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    if (score >= 60) return { level: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' }
    return { level: 'Cần cải thiện', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const confidenceQuality = getQualityLevel(confidence)
  const completionQuality = getQualityLevel(completionRate)

  const getMethodBadge = () => {
    switch (extractionMethod) {
      case 'ai-api':
        return { name: 'AI API', color: 'bg-blue-100 text-blue-800', icon: '🤖' }
      case 'hybrid':
        return { name: 'Hybrid', color: 'bg-purple-100 text-purple-800', icon: '🔀' }
      default:
        return { name: 'OCR', color: 'bg-green-100 text-green-800', icon: '🔍' }
    }
  }

  const methodBadge = getMethodBadge()

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-900">Chất lượng trích xuất</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${methodBadge.color}`}>
          {methodBadge.icon} {methodBadge.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Confidence Score */}
        <div className={`p-4 rounded-lg border ${confidenceQuality.bg} ${confidenceQuality.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Độ tin cậy</span>
            <span className={`text-xs font-semibold ${confidenceQuality.color}`}>
              {confidenceQuality.level}
            </span>
          </div>
          <div className="flex items-end space-x-2">
            <span className={`text-2xl font-bold ${confidenceQuality.color}`}>
              {Math.round(confidence)}%
            </span>
            <div className="flex-1">
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
          </div>
        </div>

        {/* Completion Rate */}
        <div className={`p-4 rounded-lg border ${completionQuality.bg} ${completionQuality.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Tỷ lệ hoàn thành</span>
            <span className={`text-xs font-semibold ${completionQuality.color}`}>
              {fieldsExtracted}/{totalFields}
            </span>
          </div>
          <div className="flex items-end space-x-2">
            <span className={`text-2xl font-bold ${completionQuality.color}`}>
              {Math.round(completionRate)}%
            </span>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    completionRate >= 80 ? 'bg-green-500' : 
                    completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Processing Time */}
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Thời gian xử lý</span>
            <span className="text-xs font-semibold text-gray-600">
              {processingTime ? (processingTime < 5 ? 'Nhanh' : processingTime < 10 ? 'Bình thường' : 'Chậm') : 'N/A'}
            </span>
          </div>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-gray-700">
              {processingTime ? `${processingTime.toFixed(1)}s` : 'N/A'}
            </span>
            <div className="flex-1">
              {processingTime && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      processingTime < 5 ? 'bg-green-500' : 
                      processingTime < 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (15 - processingTime) / 15 * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 space-y-2">
        {confidence < 70 && (
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-600">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">Độ tin cậy thấp</p>
              <p className="text-xs text-yellow-700">
                Vui lòng kiểm tra và chỉnh sửa thông tin. Thử upload ảnh chất lượng cao hơn để có kết quả tốt hơn.
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
                Một số trường thông tin chưa được trích xuất. Bạn có thể nhập thủ công các thông tin còn thiếu.
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
  )
}