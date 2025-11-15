'use client'

import { useState } from 'react'
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { processImage, OCRProgress } from '@/lib/ocr'

interface CertificateUploadProps {
  onUploadSuccess: () => void
}

export default function CertificateUpload({ onUploadSuccess }: CertificateUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file JPG, PNG, PDF')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File không được vượt quá 10MB')
      return
    }

    setFile(file)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file')
      return
    }

    setUploading(true)
    setOcrProgress({ status: 'Đang khởi tạo...', progress: 0 })

    try {
      // Bước 1: Xử lý OCR trên client
      toast.loading('Đang đọc văn bản từ chứng chỉ...', { id: 'ocr' })
      
      console.log('🔍 Bắt đầu OCR...')
      const extractedData = await processImage(file, (progress) => {
        console.log('📊 OCR Progress:', progress)
        setOcrProgress(progress)
      })

      console.log('✅ Dữ liệu trích xuất:', extractedData)
      toast.success('Đã đọc xong văn bản!', { id: 'ocr' })
      setOcrProgress({ status: 'Đang tải lên...', progress: 100 })

      // Bước 2: Upload file + dữ liệu đã trích xuất
      const formData = new FormData()
      formData.append('certificate', file)
      formData.append('extractedData', JSON.stringify(extractedData))

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/certificates/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Tải lên thành công!')
        setFile(null)
        setOcrProgress(null)
        onUploadSuccess()
      } else {
        toast.error(data.message || 'Tải lên thất bại')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Lỗi khi xử lý file')
    } finally {
      setUploading(false)
      setOcrProgress(null)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tải lên chứng chỉ</h3>
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Chọn file
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleChange}
              />
            </label>
            <span className="text-gray-600"> hoặc kéo thả vào đây</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, PDF (tối đa 10MB)
          </p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress bar khi đang xử lý OCR */}
          {ocrProgress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{ocrProgress.status}</span>
                <span>{Math.round(ocrProgress.progress * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress.progress * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {ocrProgress ? ocrProgress.status : 'Đang tải lên...'}
                </span>
              ) : (
                'Tải lên và xử lý'
              )}
            </button>
            <button
              onClick={removeFile}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Hướng dẫn:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Chọn file chứng chỉ ngoại ngữ (IELTS, TOEIC, TOEFL...)</li>
          <li>• Đảm bảo hình ảnh rõ nét, không bị mờ</li>
          <li>• Hệ thống sẽ tự động trích xuất thông tin</li>
          <li>• Bạn có thể chỉnh sửa thông tin sau khi xử lý</li>
        </ul>
      </div>
    </div>
  )
}
