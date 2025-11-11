'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

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
}

export default function UploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)

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

  const processFile = async () => {
    if (files.length === 0) {
      toast.error('Vui lòng chọn file để xử lý')
      return
    }

    setIsProcessing(true)
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock extracted data
      const mockData: ExtractedData = {
        fullName: 'Nguyễn Văn A',
        dateOfBirth: '15/03/1995',
        certificateType: 'IELTS Academic',
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
      
      setExtractedData(mockData)
      toast.success('Trích xuất thông tin thành công!')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xử lý file')
    } finally {
      setIsProcessing(false)
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
                PNG, JPG, PDF tối đa 10MB
              </p>
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
              
              <div className="mt-6 text-center">
                <button
                  onClick={processFile}
                  disabled={isProcessing}
                  className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Trích xuất thông tin'}
                </button>
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && (
            <div className="mt-12 bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin đã trích xuất:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={extractedData.fullName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    value={extractedData.dateOfBirth}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại chứng chỉ</label>
                  <input
                    type="text"
                    value={extractedData.certificateType}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số chứng chỉ</label>
                  <input
                    type="text"
                    value={extractedData.certificateNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thi</label>
                  <input
                    type="text"
                    value={extractedData.testDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                  <input
                    type="text"
                    value={extractedData.issueDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    readOnly
                  />
                </div>
              </div>

              {/* Scores */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Điểm số:</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng</label>
                    <input
                      type="text"
                      value={extractedData.scores.overall}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nghe</label>
                    <input
                      type="text"
                      value={extractedData.scores.listening}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đọc</label>
                    <input
                      type="text"
                      value={extractedData.scores.reading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Viết</label>
                    <input
                      type="text"
                      value={extractedData.scores.writing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nói</label>
                    <input
                      type="text"
                      value={extractedData.scores.speaking}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
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
          )}
        </div>
      </div>
    </section>
  )
}