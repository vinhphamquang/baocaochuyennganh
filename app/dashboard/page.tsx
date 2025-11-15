'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface User {
  _id: string
  fullName: string
  email: string
  role: string
  certificatesProcessed: number
  createdAt: string
}

interface Certificate {
  _id: string
  fileName: string
  certificateType: string
  processingStatus: string
  extractedData?: {
    fullName?: string
    certificateNumber?: string
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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCerts, setLoadingCerts] = useState(true)

  useEffect(() => {
    fetchUserInfo()
    fetchCertificates()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/certificates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates || [])
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoadingCerts(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const stats = {
    totalProcessed: certificates.length,
    successRate: certificates.length > 0 
      ? Math.round((certificates.filter(c => c.processingStatus === 'completed').length / certificates.length) * 100)
      : 0,
    thisMonth: certificates.filter(c => {
      const certDate = new Date(c.createdAt)
      const now = new Date()
      return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear()
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <UserCircleIcon className="h-8 w-8 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        {user && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <UserCircleIcon className="h-12 w-12" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.fullName}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="text-sm">
                        Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <p className="text-sm text-blue-100">Vai trò</p>
                  <p className="text-xl font-bold">
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="mt-2 text-sm bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Vào Admin Panel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Tải lên chứng chỉ</h3>
            <p className="text-sm text-gray-600">Upload và trích xuất thông tin</p>
          </button>
          
          <button
            onClick={() => router.push('/export')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <ArrowDownTrayIcon className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Xuất dữ liệu</h3>
            <p className="text-sm text-gray-600">Tải về JSON, CSV, Excel</p>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <ChartBarIcon className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Thống kê</h3>
            <p className="text-sm text-gray-600">Xem báo cáo chi tiết</p>
          </button>
        </div>
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
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Lịch sử xử lý của bạn</h2>
            {user && (
              <span className="text-sm text-gray-500">
                Tài khoản: {user.email}
              </span>
            )}
          </div>
          
          {loadingCerts ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Bạn chưa có chứng chỉ nào</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="btn-primary"
              >
                Tải lên chứng chỉ đầu tiên
              </button>
            </div>
          ) : (
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
                    <tr key={cert._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{cert.fileName || 'Không có tên'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {cert.certificateType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {cert.extractedData ? (
                          <div className="text-sm text-gray-900">
                            {cert.extractedData.fullName && (
                              <div className="font-medium">{cert.extractedData.fullName}</div>
                            )}
                            {cert.extractedData.certificateNumber && (
                              <div className="text-gray-500">{cert.extractedData.certificateNumber}</div>
                            )}
                            {cert.extractedData.scores?.overall && (
                              <div className="text-gray-500">Điểm: {cert.extractedData.scores.overall}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Chưa trích xuất</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(cert.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cert.processingStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : cert.processingStatus === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cert.processingStatus === 'completed' ? 'Hoàn thành' : 
                           cert.processingStatus === 'processing' ? 'Đang xử lý' : 'Thất bại'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {cert.processingStatus === 'completed' && (
                          <button 
                            onClick={() => router.push(`/export`)}
                            className="text-primary-600 hover:text-primary-900 flex items-center"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Xuất
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}