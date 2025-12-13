'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { processImageWithAI, OCRProgress } from '@/lib/ocr-ai-hybrid'
import ExtractionInfo from './ExtractionInfo'
import ProcessingStatus from './ProcessingStatus'
import QualityMetrics from './QualityMetrics'

interface ExtractedData {
  fullName: string
  dateOfBirth: string
  certificateType: string
  testDate: string
  issueDate: string
  certificateNumber: string
  scores: {
    overall: string
    listening: string
    reading: string
    writing: string
    speaking: string
  }
  issuingOrganization: string
  confidence?: number
  extractionMethod?: 'tesseract' | 'ai-api' | 'hybrid'
  processingTime?: number
}

export default function UploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null)
  const [formKey, setFormKey] = useState(0) // Key để force re-render

  // Debug: Log khi extractedData thay đổi
  useEffect(() => {
    console.log('📊 extractedData changed:', extractedData)
    if (extractedData) {
      // Force re-render form khi có dữ liệu mới
      setFormKey(prev => prev + 1)
    }
  }, [extractedData])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    setExtractedData(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = () => {
    setFiles([])
    setExtractedData(null)
  }

  // Validate image quality before OCR
  const validateImage = async (file: File): Promise<{ isValid: boolean; message?: string }> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        // Check image dimensions
        if (img.width < 800 || img.height < 600) {
          resolve({
            isValid: false,
            message: 'Ảnh có độ phân giải quá thấp. Vui lòng sử dụng ảnh có kích thước ít nhất 800x600 pixels.'
          })
          return
        }
        
        // Check if image is too blurry (basic check)
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
        if (imageData) {
          const data = imageData.data
          let totalVariance = 0
          let pixelCount = 0
          
          // Sample every 10th pixel to check variance (blur detection)
          for (let i = 0; i < data.length; i += 40) { // RGBA = 4 bytes, so every 10th pixel
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const gray = 0.299 * r + 0.587 * g + 0.114 * b
            
            if (i > 40) {
              const prevGray = 0.299 * data[i - 40] + 0.587 * data[i - 39] + 0.114 * data[i - 38]
              totalVariance += Math.abs(gray - prevGray)
            }
            pixelCount++
          }
          
          const avgVariance = totalVariance / pixelCount
          
          if (avgVariance < 5) {
            resolve({
              isValid: false,
              message: 'Ảnh có vẻ bị mờ hoặc thiếu độ tương phản. Vui lòng sử dụng ảnh rõ nét hơn.'
            })
            return
          }
        }
        
        resolve({ isValid: true })
      }
      
      img.onerror = () => {
        resolve({
          isValid: false,
          message: 'Không thể đọc file ảnh. Vui lòng kiểm tra định dạng file.'
        })
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const processFile = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn file để xử lý')
      return
    }

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ file ảnh (JPG, PNG). PDF sẽ được hỗ trợ trong phiên bản sau.')
      return
    }

    setIsProcessing(true)
    setOcrProgress({ status: 'Đang kiểm tra chất lượng ảnh...', progress: 0.1 })
    
    try {
      // Validate image quality first
      const validation = await validateImage(file)
      if (!validation.isValid) {
        toast.error(validation.message || 'Ảnh không đạt yêu cầu chất lượng')
        setIsProcessing(false)
        setOcrProgress(null)
        return
      }

      // Xử lý OCR với Tesseract.js
      toast.loading('Đang đọc văn bản từ chứng chỉ...', { id: 'ocr' })
      setOcrProgress({ status: 'Ảnh đạt yêu cầu, bắt đầu OCR...', progress: 0.2 })
      
      console.log('🔍 Bắt đầu OCR cho file:', file.name)
      
      const ocrData = await processImageWithAI(file, (progress) => {
        console.log('📊 OCR-AI Progress:', progress)
        setOcrProgress({
          ...progress,
          progress: 0.2 + (progress.progress * 0.8) // Scale progress from 20% to 100%
        })
      })

      console.log('✅ Dữ liệu OCR:', ocrData)
      
      // Kiểm tra xem có dữ liệu không
      const hasData = ocrData.fullName || ocrData.certificateNumber || ocrData.certificateType
      
      if (!hasData) {
        console.warn('⚠️ OCR không trích xuất được thông tin. Raw text:', ocrData.rawText?.substring(0, 200))
        
        // Phân tích lý do thất bại
        const rawText = ocrData.rawText || ''
        let errorMessage = 'Không thể trích xuất thông tin từ ảnh. '
        let suggestions = []
        
        if (rawText.length < 50) {
          errorMessage += 'OCR đọc được rất ít văn bản.'
          suggestions.push('Kiểm tra ảnh có đủ rõ nét không')
          suggestions.push('Đảm bảo ánh sáng đều, không bị tối')
          suggestions.push('Chụp thẳng góc, không bị nghiêng')
        } else if (!rawText.match(/[A-Z]{2,}/)) {
          errorMessage += 'Không tìm thấy thông tin chứng chỉ.'
          suggestions.push('Đảm bảo ảnh chứa chứng chỉ ngoại ngữ')
          suggestions.push('Thử với ảnh chất lượng cao hơn')
        } else {
          errorMessage += 'OCR đọc được văn bản nhưng không nhận diện được định dạng chứng chỉ.'
          suggestions.push('Thử với ảnh rõ nét hơn')
          suggestions.push('Đảm bảo toàn bộ chứng chỉ nằm trong khung ảnh')
        }
        
        // Hiển thị thông báo chi tiết
        toast.error(
          <div className="text-sm">
            <p className="font-semibold mb-2">{errorMessage}</p>
            <p className="text-xs text-gray-600 mb-2">Gợi ý:</p>
            <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>,
          { 
            id: 'ocr',
            duration: 8000,
            style: {
              maxWidth: '400px'
            }
          }
        )
        
        setIsProcessing(false)
        setOcrProgress(null)
        return
      }
      
      // Chuyển đổi dữ liệu OCR sang format của component
      const mockData: ExtractedData = {
        fullName: ocrData.fullName || '',
        dateOfBirth: ocrData.dateOfBirth || '',
        certificateType: ocrData.certificateType || 'Unknown',
        testDate: ocrData.examDate || '',
        issueDate: ocrData.issueDate || '',
        certificateNumber: ocrData.certificateNumber || '',
        scores: {
          overall: ocrData.scores?.overall?.toString() || '',
          listening: ocrData.scores?.listening?.toString() || '',
          reading: ocrData.scores?.reading?.toString() || '',
          writing: ocrData.scores?.writing?.toString() || '',
          speaking: ocrData.scores?.speaking?.toString() || ''
        },
        issuingOrganization: ocrData.issuingOrganization || getIssuingOrg(ocrData.certificateType || ''),
        confidence: ocrData.confidence || 0,
        extractionMethod: ocrData.extractionMethod || 'tesseract',
        processingTime: ocrData.processingTime
      }
      
      console.log('📋 Dữ liệu đã chuyển đổi:', mockData)
      setExtractedData(mockData)
      toast.success('Trích xuất thông tin thành công!', { id: 'ocr' })
      
      // Log raw text để debug
      if (ocrData.rawText) {
        console.log('📄 Raw OCR Text:', ocrData.rawText)
      }
    } catch (error) {
      console.error('❌ Lỗi OCR:', error)
      toast.error('Có lỗi xảy ra khi xử lý file', { id: 'ocr' })
    } finally {
      setIsProcessing(false)
      setOcrProgress(null)
    }
  }

  // Helper function
  function getIssuingOrg(certificateType: string): string {
    const orgMap: Record<string, string> = {
      'IELTS': 'British Council / IDP',
      'TOEIC': 'ETS',
      'TOEFL': 'ETS',
      'VSTEP': 'Bộ Giáo dục và Đào tạo'
    }
    return orgMap[certificateType] || 'Unknown'
  }

  const saveToHistory = async () => {
    if (!extractedData || files.length === 0) return

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Vui lòng đăng nhập để lưu lịch sử')
      return
    }

    try {
      const formData = new FormData()
      formData.append('certificate', files[0])
      formData.append('extractedData', JSON.stringify({
        fullName: extractedData.fullName,
        dateOfBirth: extractedData.dateOfBirth,
        certificateType: extractedData.certificateType,
        certificateNumber: extractedData.certificateNumber,
        examDate: extractedData.testDate,
        issueDate: extractedData.issueDate,
        scores: extractedData.scores,
        rawText: ''
      }))

      const response = await fetch('http://localhost:5000/api/certificates/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        toast.success('Đã lưu vào lịch sử!')
      } else {
        const data = await response.json()
        toast.error(data.message || 'Lỗi khi lưu')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Lỗi khi lưu lịch sử')
    }
  }

  const exportData = (format: 'json' | 'csv' | 'excel') => {
    if (!extractedData) return
    
    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'json':
        content = JSON.stringify(extractedData, null, 2)
        filename = 'certificate_data.json'
        mimeType = 'application/json'
        break
      case 'csv':
        content = `Họ tên,Ngày sinh,Loại chứng chỉ,Ngày thi,Ngày cấp,Số chứng chỉ,Điểm tổng,Nghe,Đọc,Viết,Nói,Đơn vị cấp\n`
        content += `${extractedData.fullName},${extractedData.dateOfBirth},${extractedData.certificateType},${extractedData.testDate},${extractedData.issueDate},${extractedData.certificateNumber},${extractedData.scores.overall},${extractedData.scores.listening},${extractedData.scores.reading},${extractedData.scores.writing},${extractedData.scores.speaking},${extractedData.issuingOrganization}`
        filename = 'certificate_data.csv'
        mimeType = 'text/csv'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Đã xuất file ${format.toUpperCase()}`)
  }

  return (
    <section id="upload" className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tải lên chứng chỉ của bạn
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Hỗ trợ định dạng JPG, PNG, PDF. Kích thước tối đa 10MB.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Thả file vào đây...' : 'Kéo thả file hoặc click để chọn'}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                PNG, JPG tối đa 10MB
              </p>
              
              {/* Image Quality Requirements */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Để OCR chính xác, ảnh cần:
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Độ phân giải tối thiểu 800x600 pixels
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Ảnh rõ nét, không bị mờ
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Ánh sáng đều, không bị tối
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                    Chụp thẳng góc, không nghiêng
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">File đã chọn:</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentIcon className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              
              {/* AI-OCR Processing Status */}
              {ocrProgress && (
                <div className="mt-6">
                  <ProcessingStatus 
                    currentStep={ocrProgress.status}
                    progress={ocrProgress.progress}
                    method="hybrid"
                  />
                </div>
              )}
              
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={processFile}
                  disabled={isProcessing}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {ocrProgress ? ocrProgress.status : 'Đang xử lý...'}
                    </span>
                  ) : (
                    'Trích xuất thông tin (OCR)'
                  )}
                </button>
                
                {/* Nút test với mock data */}
                <button
                  onClick={() => {
                    const testData: ExtractedData = {
                      fullName: 'NGUYEN VAN A',
                      dateOfBirth: '15/03/1995',
                      certificateType: 'IELTS',
                      testDate: '12/10/2023',
                      issueDate: '25/10/2023',
                      certificateNumber: 'IELTS-2023-ABC123',
                      scores: {
                        overall: '7.5',
                        listening: '8.0',
                        reading: '7.0',
                        writing: '7.0',
                        speaking: '8.0'
                      },
                      issuingOrganization: 'British Council'
                    }
                    console.log('🧪 Setting test data:', testData)
                    setExtractedData(testData)
                    console.log('✅ State should be updated now')
                    toast.success('Đã điền dữ liệu test!')
                  }}
                  disabled={isProcessing}
                  className="btn-secondary px-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test với dữ liệu mẫu
                </button>
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && (
            <div key={formKey} className="mt-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Thông tin đã trích xuất</h3>
                  <p className="text-sm text-gray-600">Dữ liệu từ chứng chỉ {extractedData.certificateType}</p>
                </div>
              </div>
              
              {/* Quality Metrics */}
              {extractedData.extractionMethod && (
                <div className="mb-6">
                  <QualityMetrics 
                    confidence={extractedData.confidence || 0}
                    extractionMethod={extractedData.extractionMethod}
                    fieldsExtracted={Object.values(extractedData).filter(value => 
                      value && (typeof value === 'string' ? value.trim() && value !== '(Chưa có dữ liệu)' : true)
                    ).length}
                    totalFields={8}
                    processingTime={extractedData.processingTime}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ và tên - Highlighted */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Họ và tên
                  </label>
                  <div className="w-full px-5 py-4 border-2 border-blue-500 rounded-xl bg-gradient-to-r from-blue-50 to-white shadow-md hover:shadow-lg transition-shadow">
                    <p className="font-bold text-xl text-gray-900">
                      {extractedData.fullName || '(Chưa có dữ liệu)'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Ngày sinh</label>
                  <div className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-semibold text-base text-gray-900">{extractedData.dateOfBirth || '(Chưa có dữ liệu)'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🎓 Loại chứng chỉ</label>
                  <div className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-semibold text-base text-blue-600">{extractedData.certificateType || '(Chưa có dữ liệu)'}</p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🔢 Số chứng chỉ</label>
                  <div className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-mono font-semibold text-base text-gray-900">{extractedData.certificateNumber || '(Chưa có dữ liệu)'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Ngày thi</label>
                  <div className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-semibold text-base text-gray-900">{extractedData.testDate || '(Chưa có dữ liệu)'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">✅ Ngày cấp</label>
                  <div className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <p className="font-semibold text-base text-gray-900">{extractedData.issueDate || '(Chưa có dữ liệu)'}</p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="mt-8 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Điểm số chi tiết</h4>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {/* Overall Score - Highlighted */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-yellow-700 mb-2 text-center">🏆 TỔNG</label>
                    <div className="w-full px-4 py-6 border-4 border-yellow-400 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="font-black text-5xl text-center text-yellow-700">{extractedData.scores.overall || '0'}</p>
                      <p className="text-xs text-center text-yellow-600 mt-1 font-semibold">Band Score</p>
                    </div>
                  </div>
                  
                  {/* Listening */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">🎧 Nghe</label>
                    <div className="w-full px-4 py-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-md hover:shadow-lg transition-all">
                      <p className="font-bold text-3xl text-center text-blue-600">{extractedData.scores.listening || '0'}</p>
                    </div>
                  </div>
                  
                  {/* Reading */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">📖 Đọc</label>
                    <div className="w-full px-4 py-6 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-lg transition-all">
                      <p className="font-bold text-3xl text-center text-green-600">{extractedData.scores.reading || '0'}</p>
                    </div>
                  </div>
                  
                  {/* Writing */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">✍️ Viết</label>
                    <div className="w-full px-4 py-6 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white shadow-md hover:shadow-lg transition-all">
                      <p className="font-bold text-3xl text-center text-purple-600">{extractedData.scores.writing || '0'}</p>
                    </div>
                  </div>
                  
                  {/* Speaking */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">🗣️ Nói</label>
                    <div className="w-full px-4 py-6 border-2 border-red-200 rounded-xl bg-gradient-to-br from-red-50 to-white shadow-md hover:shadow-lg transition-all">
                      <p className="font-bold text-3xl text-center text-red-600">{extractedData.scores.speaking || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                {/* Save to History Button - Only show if logged in */}
                {localStorage.getItem('token') && (
                  <div className="flex justify-center">
                    <button
                      onClick={saveToHistory}
                      className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Lưu vào lịch sử
                    </button>
                  </div>
                )}
                
                {/* Export Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => exportData('json')}
                    className="btn-secondary"
                  >
                    Xuất JSON
                  </button>
                  <button
                    onClick={() => exportData('csv')}
                    className="btn-secondary"
                  >
                    Xuất CSV
                  </button>
                  <button
                    onClick={() => exportData('excel')}
                    className="btn-primary"
                  >
                    Xuất Excel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}