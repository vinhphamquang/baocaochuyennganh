'use client';

import React, { useState, useCallback } from 'react';
import { processLowResolutionImage, ExtractedData, OCRProgress } from '@/lib/ocr-low-resolution-enhancer';

interface LowResolutionOCRProps {
  onResult?: (data: ExtractedData) => void;
  onError?: (error: string) => void;
}

export default function LowResolutionOCR({ onResult, onError }: LowResolutionOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress>({ status: '', progress: 0 });
  const [result, setResult] = useState<ExtractedData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const data = await processLowResolutionImage(selectedFile, (progress) => {
        setProgress(progress);
      });

      setResult(data);
      onResult?.(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý ảnh';
      onError?.(errorMessage);
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
      setProgress({ status: '', progress: 0 });
    }
  }, [selectedFile, onResult, onError]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔍 OCR Nâng Cao cho Ảnh Độ Phân Giải Thấp
        </h2>
        <p className="text-gray-600">
          Hệ thống AI tự động phát hiện và cải thiện chất lượng ảnh trước khi nhận dạng văn bản
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn ảnh chứng chỉ
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={isProcessing}
        />
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ảnh gốc:</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-auto max-h-96 mx-auto rounded border"
            />
          </div>
        </div>
      )}

      {/* Process Button */}
      {selectedFile && (
        <div className="mb-6">
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Đang xử lý...' : '🚀 Bắt đầu xử lý OCR nâng cao'}
          </button>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progress.status} ({Math.round(progress.progress * 100)}%)
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Quality Metrics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Thông tin xử lý:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(result.imageQuality)}`}>
                  Chất lượng ảnh: {result.imageQuality.toUpperCase()}
                </div>
              </div>
              <div className="text-center">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                  Độ tin cậy: {result.confidence}%
                </div>
              </div>
              <div className="text-center">
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-100">
                  Cải thiện: {result.enhancementApplied.length} kỹ thuật
                </div>
              </div>
            </div>
          </div>

          {/* Enhancement Applied */}
          {result.enhancementApplied.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-blue-800 mb-2">🔧 Kỹ thuật cải thiện đã áp dụng:</h4>
              <div className="flex flex-wrap gap-2">
                {result.enhancementApplied.map((enhancement, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full"
                  >
                    {enhancement}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Thông tin trích xuất:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.fullName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ và tên:</label>
                  <p className="text-gray-900 font-semibold">{result.fullName}</p>
                </div>
              )}
              
              {result.certificateType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại chứng chỉ:</label>
                  <p className="text-gray-900 font-semibold">{result.certificateType}</p>
                </div>
              )}
              
              {result.certificateNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số chứng chỉ:</label>
                  <p className="text-gray-900 font-semibold">{result.certificateNumber}</p>
                </div>
              )}
              
              {result.dateOfBirth && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày sinh:</label>
                  <p className="text-gray-900 font-semibold">{result.dateOfBirth}</p>
                </div>
              )}
              
              {result.examDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày thi:</label>
                  <p className="text-gray-900 font-semibold">{result.examDate}</p>
                </div>
              )}
              
              {result.issuingOrganization && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Đơn vị cấp:</label>
                  <p className="text-gray-900 font-semibold">{result.issuingOrganization}</p>
                </div>
              )}
            </div>
          </div>

          {/* Scores */}
          {result.scores && Object.keys(result.scores).length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">🎯 Điểm số:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.scores).map(([skill, score]) => (
                  <div key={skill} className="text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-sm text-gray-600 capitalize">{skill}:</p>
                      <p className="text-xl font-bold text-purple-600">{score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Text */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Văn bản gốc:</h3>
            <div className="bg-white rounded border p-3 max-h-40 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result.rawText}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-yellow-50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-yellow-800 mb-2">💡 Mẹo để có kết quả tốt nhất:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Hệ thống tự động phát hiện và cải thiện ảnh độ phân giải thấp</li>
          <li>• Áp dụng Super Resolution, Edge Enhancement, và Adaptive Thresholding</li>
          <li>• Sử dụng Multi-pass OCR với các cấu hình khác nhau</li>
          <li>• Fuzzy matching và AI correction cho văn bản bị lỗi</li>
          <li>• Tốt nhất là ảnh có độ phân giải từ 300x300 pixel trở lên</li>
        </ul>
      </div>
    </div>
  );
}