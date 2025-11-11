'use client'

import { useState } from 'react'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline'

interface ProcessedCertificate {
  id: string
  fileName: string
  certificateType: string
  processedDate: string
  status: 'success' | 'failed'
  extractedData?: {
    fullName: string
    certificateNumber: string
    overallScore: string
  }
}

export default function Dashboard() {
  const [certificates] = useState<ProcessedCertificate[]>([
    {
      id: '1',
      fileName: 'ielts_certificate.pdf',
      certificateType: 'IELTS',
      processedDate: '2023-11-01',
      status: 'success',
      extractedData: {
        fullName: 'Nguyễn Văn A',
        certificateNumber: 'IELTS-2023-ABC123',
        overallScore: '7.5'
      }
    },
    {
      id: '2',
      fileName: 'toefl_result.jpg',
      certificateType: 'TOEFL',
      processedDate: '2023-10-28',
      status: 'success',
      extractedData: {
        fullName: 'Nguyễn Văn A',
        certificateNumber: 'TOEFL-2023-XYZ789',
        overallScore: '95'
      }
    },
    {
      id: '3',
      fileName: 'toeic_certificate.png',
      certificateType: 'TOEIC',
      processedDate: '2023-10-25',
      status: 'failed'
    }
  ])

  const stats = {
    totalProcessed: certificates.length,
    successRate: Math.round((certificates.filter(c => c.status === 'success').length / certificates.length) * 100),
    thisMonth: certificates.filter(c => new Date(c.processedDate).getMonth() === new Date().getMonth()).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Quản lý chứng chỉ đã xử lý</p>
            </div>
            <div className="flex space-x-4">
              <a href="/" className="btn-secondary">
                Về trang chủ
              </a>
              <a href="#upload" className="btn-primary">
                Tải lên mới
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng số đã xử lý</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProcessed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tỷ lệ thành công</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tháng này</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.thisMonth}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lịch sử xử lý</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại chứng chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin trích xuất
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày xử lý
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{cert.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                        {cert.certificateType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cert.extractedData ? (
                        <div className="text-sm text-gray-900">
                          <div>{cert.extractedData.fullName}</div>
                          <div className="text-gray-500">{cert.extractedData.certificateNumber}</div>
                          <div className="text-gray-500">Điểm: {cert.extractedData.overallScore}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Không có dữ liệu</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.processedDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cert.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cert.status === 'success' ? 'Thành công' : 'Thất bại'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {cert.status === 'success' && (
                        <button className="text-primary-600 hover:text-primary-900 flex items-center">
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          Tải xuống
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}