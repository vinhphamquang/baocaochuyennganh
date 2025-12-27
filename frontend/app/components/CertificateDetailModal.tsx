'use client'

import { XMarkIcon, DocumentTextIcon, UserIcon, ChartBarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Certificate {
  _id: string
  fileName: string
  certificateType: string
  processingStatus: string
  ocrConfidence?: number
  extractedData?: {
    fullName?: string
    dateOfBirth?: string
    certificateNumber?: string
    testDate?: string
    issueDate?: string
    issuingOrganization?: string
    scores?: {
      overall?: string
      listening?: string
      reading?: string
      writing?: string
      speaking?: string
    }
  }
  createdAt: string
}

interface CertificateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  certificate: Certificate | null
}

export default function CertificateDetailModal({ isOpen, onClose, certificate }: CertificateDetailModalProps) {
  if (!isOpen || !certificate) return null

  // Export functions
  const exportToJSON = () => {
    const data = {
      fileName: certificate.fileName,
      certificateType: certificate.certificateType,
      extractedData: certificate.extractedData,
      createdAt: certificate.createdAt,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${certificate.fileName}_data.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const data = certificate.extractedData
    const csvContent = [
      ['Field', 'Value'],
      ['File Name', certificate.fileName],
      ['Certificate Type', certificate.certificateType],
      ['Full Name', data?.fullName || ''],
      ['Date of Birth', data?.dateOfBirth || ''],
      ['Certificate Number', data?.certificateNumber || ''],
      ['Test Date', data?.testDate || ''],
      ['Issue Date', data?.issueDate || ''],
      ['Issuing Organization', data?.issuingOrganization || ''],
      ['Overall Score', data?.scores?.overall || ''],
      ['Listening Score', data?.scores?.listening || ''],
      ['Reading Score', data?.scores?.reading || ''],
      ['Writing Score', data?.scores?.writing || ''],
      ['Speaking Score', data?.scores?.speaking || ''],
      ['Processing Date', new Date(certificate.createdAt).toLocaleDateString('vi-VN')],
      ['Export Date', new Date().toLocaleDateString('vi-VN')]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${certificate.fileName}_data.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    // Create Excel-compatible HTML table
    const data = certificate.extractedData
    const excelContent = `
      <table>
        <tr><th>Trường thông tin</th><th>Giá trị</th></tr>
        <tr><td>Tên file</td><td>${certificate.fileName}</td></tr>
        <tr><td>Loại chứng chỉ</td><td>${certificate.certificateType}</td></tr>
        <tr><td>Họ và tên</td><td>${data?.fullName || ''}</td></tr>
        <tr><td>Ngày sinh</td><td>${data?.dateOfBirth || ''}</td></tr>
        <tr><td>Số chứng chỉ</td><td>${data?.certificateNumber || ''}</td></tr>
        <tr><td>Ngày thi</td><td>${data?.testDate || ''}</td></tr>
        <tr><td>Ngày cấp</td><td>${data?.issueDate || ''}</td></tr>
        <tr><td>Tổ chức cấp</td><td>${data?.issuingOrganization || ''}</td></tr>
        <tr><td>Điểm tổng</td><td>${data?.scores?.overall || ''}</td></tr>
        <tr><td>Điểm nghe</td><td>${data?.scores?.listening || ''}</td></tr>
        <tr><td>Điểm đọc</td><td>${data?.scores?.reading || ''}</td></tr>
        <tr><td>Điểm viết</td><td>${data?.scores?.writing || ''}</td></tr>
        <tr><td>Điểm nói</td><td>${data?.scores?.speaking || ''}</td></tr>
        <tr><td>Ngày xử lý</td><td>${new Date(certificate.createdAt).toLocaleDateString('vi-VN')}</td></tr>
        <tr><td>Ngày xuất</td><td>${new Date().toLocaleDateString('vi-VN')}</td></tr>
      </table>
    `

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${certificate.fileName}_data.xls`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500'
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành'
      case 'processing': return 'Đang xử lý'
      case 'failed': return 'Thất bại'
      default: return 'Không xác định'
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print:relative print:z-0">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full print:shadow-none print:rounded-none print:max-w-none">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 print:bg-white print:border-b print:border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white print:text-gray-900">
                    Chi tiết chứng chỉ
                  </h3>
                  <p className="text-blue-100 text-sm print:text-gray-600">
                    {certificate.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-lg print:hidden"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Thông tin cơ bản */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                    Thông tin cơ bản
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {certificate.extractedData?.fullName || 'Chưa có thông tin'}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại chứng chỉ</label>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          certificate.certificateType === 'IELTS' ? 'bg-blue-100 text-blue-800' :
                          certificate.certificateType === 'TOEIC' ? 'bg-green-100 text-green-800' :
                          certificate.certificateType === 'TOEFL' ? 'bg-purple-100 text-purple-800' :
                          certificate.certificateType === 'VSTEP' ? 'bg-orange-100 text-orange-800' :
                          certificate.certificateType === 'HSK' ? 'bg-red-100 text-red-800' :
                          certificate.certificateType === 'JLPT' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {certificate.certificateType}
                        </span>
                        {certificate.certificateType === 'IELTS' && '🇬🇧'}
                        {certificate.certificateType === 'TOEIC' && '🇺🇸'}
                        {certificate.certificateType === 'TOEFL' && '🇺🇸'}
                        {certificate.certificateType === 'VSTEP' && '🇻🇳'}
                        {certificate.certificateType === 'HSK' && '🇨🇳'}
                        {certificate.certificateType === 'JLPT' && '🇯🇵'}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số chứng chỉ</label>
                      <p className="text-base font-mono text-gray-900">
                        {certificate.extractedData?.certificateNumber || 'Chưa có thông tin'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                        <p className="text-base text-gray-900">
                          {certificate.extractedData?.dateOfBirth || 'Chưa có thông tin'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thi</label>
                        <p className="text-base text-gray-900">
                          {certificate.extractedData?.testDate || 'Chưa có thông tin'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổ chức cấp</label>
                      <p className="text-base text-gray-900">
                        {certificate.extractedData?.issuingOrganization || 'Chưa có thông tin'}
                      </p>
                    </div>

                    {/* Thông tin file */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-2">Thông tin file</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tên file:</span>
                          <span className="font-medium text-blue-900">{certificate.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">ID chứng chỉ:</span>
                          <span className="font-mono text-xs text-blue-900">{certificate._id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Điểm số */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-yellow-600" />
                    Điểm số chi tiết
                  </h4>

                  {certificate.extractedData?.scores ? (
                    <div className="space-y-4">
                      {/* Điểm tổng */}
                      {certificate.extractedData.scores.overall && (
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-2 border-yellow-200">
                          <label className="block text-sm font-medium text-yellow-800 mb-1">Điểm tổng</label>
                          <div className="flex items-center gap-3">
                            <p className="text-3xl font-bold text-yellow-900">
                              {certificate.extractedData.scores.overall}
                            </p>
                            {certificate.certificateType === 'IELTS' && (
                              <div className="text-xs text-yellow-700">
                                <div>Thang điểm: 0-9</div>
                                <div className="font-medium">
                                  {parseFloat(certificate.extractedData.scores.overall || '0') >= 7.0 ? '🎉 Xuất sắc' :
                                   parseFloat(certificate.extractedData.scores.overall || '0') >= 6.0 ? '👍 Tốt' :
                                   parseFloat(certificate.extractedData.scores.overall || '0') >= 5.0 ? '📚 Trung bình' : '💪 Cần cải thiện'}
                                </div>
                              </div>
                            )}
                            {certificate.certificateType === 'TOEIC' && (
                              <div className="text-xs text-yellow-700">
                                <div>Thang điểm: 10-990</div>
                                <div className="font-medium">
                                  {parseInt(certificate.extractedData.scores.overall || '0') >= 800 ? '🎉 Xuất sắc' :
                                   parseInt(certificate.extractedData.scores.overall || '0') >= 600 ? '👍 Tốt' :
                                   parseInt(certificate.extractedData.scores.overall || '0') >= 400 ? '📚 Trung bình' : '💪 Cần cải thiện'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Các kỹ năng */}
                      <div className="grid grid-cols-2 gap-3">
                        {certificate.extractedData.scores.listening && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <label className="block text-xs font-medium text-blue-700 mb-1">Nghe</label>
                            <p className="text-xl font-bold text-blue-900">
                              {certificate.extractedData.scores.listening}
                            </p>
                          </div>
                        )}

                        {certificate.extractedData.scores.reading && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <label className="block text-xs font-medium text-green-700 mb-1">Đọc</label>
                            <p className="text-xl font-bold text-green-900">
                              {certificate.extractedData.scores.reading}
                            </p>
                          </div>
                        )}

                        {certificate.extractedData.scores.writing && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <label className="block text-xs font-medium text-purple-700 mb-1">Viết</label>
                            <p className="text-xl font-bold text-purple-900">
                              {certificate.extractedData.scores.writing}
                            </p>
                          </div>
                        )}

                        {certificate.extractedData.scores.speaking && (
                          <div className="bg-red-50 p-3 rounded-lg">
                            <label className="block text-xs font-medium text-red-700 mb-1">Nói</label>
                            <p className="text-xl font-bold text-red-900">
                              {certificate.extractedData.scores.speaking}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Chưa có thông tin điểm số</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Điểm số có thể chưa được trích xuất hoặc không có trong file
                      </p>
                    </div>
                  )}
                </div>

                {/* Thông tin xử lý */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-600" />
                    Thông tin xử lý
                  </h5>
                  <div className="space-y-3">
                    {/* Độ tin cậy */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Độ tin cậy OCR:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (certificate.ocrConfidence || 0) >= 80 ? 'bg-green-500' :
                              (certificate.ocrConfidence || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${certificate.ocrConfidence || 0}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium text-sm ${getConfidenceColor(certificate.ocrConfidence)}`}>
                          {certificate.ocrConfidence || 0}%
                        </span>
                      </div>
                    </div>

                    {/* Trạng thái */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Trạng thái xử lý:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certificate.processingStatus)}`}>
                        <CheckCircleIcon className="h-3 w-3 inline mr-1" />
                        {getStatusText(certificate.processingStatus)}
                      </span>
                    </div>

                    {/* Ngày xử lý */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Thời gian xử lý:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {formatDate(certificate.createdAt)}
                      </span>
                    </div>

                    {/* Ngày cấp chứng chỉ */}
                    {certificate.extractedData?.issueDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Ngày cấp:</span>
                        <span className="font-medium text-gray-900 text-sm">
                          {certificate.extractedData.issueDate}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center print:hidden">
            <div className="flex gap-3">
              <div className="relative group">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Xuất dữ liệu
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="py-2">
                        <button
                          onClick={exportToExcel}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <span className="text-green-600">📊</span>
                          Xuất Excel (.xls)
                        </button>
                        <button
                          onClick={exportToCSV}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <span className="text-blue-600">📋</span>
                          Xuất CSV (.csv)
                        </button>
                        <button
                          onClick={exportToJSON}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <span className="text-purple-600">🔧</span>
                          Xuất JSON (.json)
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In
                  </button>

                  <button
                    onClick={() => {
                      const shareText = `🎓 Chứng chỉ ${certificate.certificateType}\n` +
                        `👤 Họ tên: ${certificate.extractedData?.fullName || 'N/A'}\n` +
                        `📋 Số chứng chỉ: ${certificate.extractedData?.certificateNumber || 'N/A'}\n` +
                        `📊 Điểm số: ${certificate.extractedData?.scores?.overall || 'N/A'}\n` +
                        `📅 Ngày xử lý: ${formatDate(certificate.createdAt)}`
                      
                      if (navigator.share) {
                        navigator.share({
                          title: 'Thông tin chứng chỉ',
                          text: shareText
                        })
                      } else {
                        navigator.clipboard.writeText(shareText).then(() => {
                          alert('Đã sao chép thông tin vào clipboard!')
                        })
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Chia sẻ
                  </button>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}