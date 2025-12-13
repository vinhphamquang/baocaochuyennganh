'use client'

interface ExtractionInfoProps {
  method: 'tesseract' | 'ai-api' | 'hybrid';
  confidence: number;
  processingTime?: number;
}

export default function ExtractionInfo({ method, confidence, processingTime }: ExtractionInfoProps) {
  const getMethodInfo = () => {
    switch (method) {
      case 'ai-api':
        return {
          name: 'AI API',
          icon: '🤖',
          color: 'from-blue-500 to-blue-600',
          description: 'Sử dụng AI API chuyên dụng'
        };
      case 'hybrid':
        return {
          name: 'Hybrid AI',
          icon: '🔀',
          color: 'from-purple-500 to-purple-600',
          description: 'Kết hợp AI API + Tesseract OCR'
        };
      default:
        return {
          name: 'Tesseract OCR',
          icon: '🔍',
          color: 'from-green-500 to-green-600',
          description: 'Sử dụng Tesseract.js OCR'
        };
    }
  };

  const methodInfo = getMethodInfo();
  const confidenceColor = confidence >= 80 ? 'text-green-600' : 
                         confidence >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${methodInfo.color} rounded-lg flex items-center justify-center shadow-md`}>
            <span className="text-xl">{methodInfo.icon}</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{methodInfo.name}</h4>
            <p className="text-sm text-gray-600">{methodInfo.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${confidenceColor}`}>
            {Math.round(confidence)}%
          </div>
          <p className="text-xs text-gray-500">Độ tin cậy</p>
          {processingTime && (
            <p className="text-xs text-gray-500 mt-1">
              {processingTime.toFixed(1)}s
            </p>
          )}
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
      
      {/* Tips based on confidence */}
      {confidence < 70 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            💡 Độ tin cậy thấp. Vui lòng kiểm tra và chỉnh sửa thông tin nếu cần.
          </p>
        </div>
      )}
    </div>
  );
}