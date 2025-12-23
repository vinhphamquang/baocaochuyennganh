'use client';

import React, { useState } from 'react';
import LowResolutionOCR from '@/app/components/LowResolutionOCR';
import { ExtractedData } from '@/lib/ocr-low-resolution-enhancer';

export default function LowResOCRPage() {
  const [results, setResults] = useState<ExtractedData[]>([]);
  const [error, setError] = useState<string>('');

  const handleResult = (data: ExtractedData) => {
    setResults(prev => [data, ...prev]);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearResults = () => {
    setResults([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔍 OCR Nâng Cao cho Ảnh Độ Phân Giải Thấp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hệ thống AI tự động phát hiện, cải thiện chất lượng ảnh và nhận dạng văn bản với độ chính xác cao, 
            đặc biệt tối ưu cho ảnh có độ phân giải thấp hoặc chất lượng kém.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Image Enhancement</h3>
            <p className="text-gray-600 text-sm">
              Tự động phát hiện chất lượng ảnh và áp dụng Super Resolution, Edge Enhancement, 
              Adaptive Histogram Equalization
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Multi-Pass OCR</h3>
            <p className="text-gray-600 text-sm">
              Thực hiện OCR với nhiều cấu hình khác nhau và chọn kết quả tốt nhất, 
              tối ưu cho từng loại layout
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Text Correction</h3>
            <p className="text-gray-600 text-sm">
              Fuzzy matching và AI correction để sửa lỗi OCR, 
              nhận dạng thông tin chứng chỉ với độ chính xác cao
            </p>
          </div>
        </div>

        {/* Main OCR Component */}
        <LowResolutionOCR onResult={handleResult} onError={handleError} />

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-500 text-xl mr-3">❌</div>
              <div>
                <h4 className="text-red-800 font-semibold">Lỗi xử lý:</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results History */}
        {results.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">📋 Lịch sử kết quả</h2>
              <button
                onClick={clearResults}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
            
            <div className="space-y-6">
              {results.map((result, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Kết quả #{results.length - index}
                    </h3>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.imageQuality === 'high' ? 'bg-green-100 text-green-800' :
                        result.imageQuality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.imageQuality.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.confidence >= 80 ? 'bg-green-100 text-green-800' :
                        result.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.confidence}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.fullName && (
                      <div>
                        <span className="text-sm text-gray-500">Họ tên:</span>
                        <p className="font-semibold">{result.fullName}</p>
                      </div>
                    )}
                    
                    {result.certificateType && (
                      <div>
                        <span className="text-sm text-gray-500">Loại:</span>
                        <p className="font-semibold">{result.certificateType}</p>
                      </div>
                    )}
                    
                    {result.certificateNumber && (
                      <div>
                        <span className="text-sm text-gray-500">Số chứng chỉ:</span>
                        <p className="font-semibold">{result.certificateNumber}</p>
                      </div>
                    )}
                    
                    {result.examDate && (
                      <div>
                        <span className="text-sm text-gray-500">Ngày thi:</span>
                        <p className="font-semibold">{result.examDate}</p>
                      </div>
                    )}
                    
                    {result.scores && Object.keys(result.scores).length > 0 && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <span className="text-sm text-gray-500">Điểm số:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(result.scores).map(([skill, score]) => (
                            <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {skill}: {score}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {result.enhancementApplied.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm text-gray-500">Cải thiện áp dụng:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.enhancementApplied.map((enhancement, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {enhancement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Details */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔬 Chi tiết kỹ thuật</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Image Enhancement Techniques:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Super Resolution:</strong> Bicubic Interpolation với edge enhancement</li>
                <li>• <strong>Adaptive Unsharp Masking:</strong> Tăng độ sắc nét dựa trên local contrast</li>
                <li>• <strong>Edge-preserving Smoothing:</strong> Bilateral filter giảm noise</li>
                <li>• <strong>Adaptive Histogram Equalization:</strong> Cải thiện contrast theo vùng</li>
                <li>• <strong>Quality Analysis:</strong> Tự động phân tích sharpness và contrast</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">OCR & AI Processing:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Multi-Pass OCR:</strong> 4 cấu hình khác nhau (Standard, Block, Line, Raw)</li>
                <li>• <strong>Fuzzy Matching:</strong> Levenshtein distance cho certificate type</li>
                <li>• <strong>AI Text Correction:</strong> 30+ OCR error patterns</li>
                <li>• <strong>Context-aware Extraction:</strong> Phân tích ngữ cảnh cho dates, names</li>
                <li>• <strong>Validation:</strong> Type-specific validation cho scores và numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}