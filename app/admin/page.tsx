'use client'

import { useState, useEffect } from 'react'
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  createdAt: string
  certificatesProcessed: number
  isActive: boolean
  role: string
}

interface Certificate {
  _id: string
  userId: string
  fileName: string
  certificateType: string
  processingStatus: string
  createdAt: string
  extractedData: any
}

interface Statistics {
  totalUsers: number
  activeUsers: number
  totalCertificates: number
  completedCertificates: number
  failedCertificates: number
  todayProcessed: number
  successRate: number
  certificatesByType: Array<{ _id: string; count: number }>
}

interface SystemLog {
  id: string
  timestamp: string
  type: 'info' | 'warning' | 'error'
  message: string
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'certificates' | 'logs'>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [noAuth, setNoAuth] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginLoading, setLoginLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userActivities, setUserActivities] = useState<Certificate[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  // Fetch data từ API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (!token) {
        setLoading(false)
        setNoAuth(true)
        return
      }

      // Kiểm tra vai trò admin
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role !== 'admin') {
          toast.error('Bạn không có quyền truy cập trang này. Đang chuyển về trang chủ...')
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
          setLoading(false)
          return
        }
      }

      // Fetch statistics
      const statsRes = await fetch('http://localhost:5000/api/admin/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!statsRes.ok) {
        if (statsRes.status === 403) {
          toast.error('Bạn không có quyền truy cập. Đang chuyển về trang chủ...')
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
          setLoading(false)
          return
        }
      } else {
        const statsData = await statsRes.json()
        setStatistics(statsData.statistics)
      }

      // Fetch users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users)
      }

      // Fetch certificates
      const certsRes = await fetch('http://localhost:5000/api/admin/certificates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (certsRes.ok) {
        const certsData = await certsRes.json()
        setCertificates(certsData.certificates)
      }

    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`${!currentStatus ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`)
        fetchData() // Reload data
      } else {
        toast.error('Lỗi khi cập nhật trạng thái')
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Xóa người dùng thành công')
        fetchData()
      } else {
        toast.error('Lỗi khi xóa người dùng')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('Lỗi khi xóa người dùng')
    }
  }

  const viewUserActivities = async (user: User) => {
    console.log('👤 Viewing activities for user:', user)
    console.log('📋 All certificates:', certificates)
    
    setSelectedUser(user)
    setLoadingActivities(true)
    
    try {
      // Lọc chứng chỉ của user này - so sánh cả string và object
      const userCerts = certificates.filter(cert => {
        const certUserId = typeof cert.userId === 'object' ? (cert.userId as any)._id : cert.userId
        const userId = user._id
        console.log(`Comparing: ${certUserId} === ${userId}`, certUserId === userId)
        return certUserId === userId || cert.userId === userId || String(cert.userId) === String(userId)
      })
      
      console.log('✅ Filtered certificates for user:', userCerts)
      setUserActivities(userCerts)
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Lỗi khi tải hoạt động')
    } finally {
      setLoadingActivities(false)
    }
  }

  const closeActivityModal = () => {
    setSelectedUser(null)
    setUserActivities([])
  }

  // Nếu chưa đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (response.ok) {
        if (data.user.role !== 'admin') {
          toast.error('Chỉ admin mới có thể truy cập. Đang chuyển về trang chủ...')
          // Lưu token và user để giữ trạng thái đăng nhập
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
          return
        }
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        toast.success('Đăng nhập thành công!')
        window.location.reload()
      } else {
        toast.error(data.message || 'Đăng nhập thất bại')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setLoginLoading(false)
    }
  }

  // Nếu chưa đăng nhập
  if (noAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CogIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Đăng nhập Admin
            </h2>
            <p className="text-gray-600 mt-2">
              Truy cập bảng điều khiển quản trị
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Mật khẩu
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600 mb-3">
              Chưa có tài khoản admin?
            </p>
            <a
              href="/admin/register"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center"
            >
              Đăng ký Admin
            </a>
          </div>

          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Về trang chủ
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: ChartBarIcon },
    { id: 'users', name: 'Người dùng', icon: UsersIcon },
    { id: 'certificates', name: 'Chứng chỉ', icon: DocumentTextIcon },
    { id: 'logs', name: 'Nhật ký', icon: CogIcon }
  ]

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      toast.success('Đã đăng xuất')
      window.location.href = '/admin'
    }
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <CogIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Xin chào, {user.fullName || 'Admin'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="/" 
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                🏠 Trang chủ
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-md hover:shadow-lg"
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-8">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Tổng người dùng</p>
                    <p className="text-4xl font-bold">{statistics?.totalUsers || 0}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <UsersIcon className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Người dùng hoạt động</p>
                    <p className="text-4xl font-bold">{statistics?.activeUsers || 0}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <UsersIcon className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Tổng chứng chỉ</p>
                    <p className="text-4xl font-bold">{statistics?.totalCertificates || 0}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <DocumentTextIcon className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">Hôm nay</p>
                    <p className="text-4xl font-bold">{statistics?.todayProcessed || 0}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <ChartBarIcon className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">📊 Hoạt động gần đây</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        log.type === 'error' ? 'bg-red-500' :
                        log.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quản lý người dùng</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tham gia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chứng chỉ đã xử lý
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
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.certificatesProcessed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button 
                          onClick={() => viewUserActivities(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Xem hoạt động
                        </button>
                        <button 
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          {user.isActive ? 'Khóa' : 'Kích hoạt'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Nhật ký hệ thống</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className={`p-4 rounded-lg border-l-4 ${
                    log.type === 'error' ? 'bg-red-50 border-red-400' :
                    log.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-green-50 border-green-400'
                  }`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {log.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />}
                        {log.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />}
                        {log.type === 'info' && <DocumentTextIcon className="h-5 w-5 text-green-400" />}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${
                          log.type === 'error' ? 'text-red-800' :
                          log.type === 'warning' ? 'text-yellow-800' :
                          'text-green-800'
                        }`}>
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Activity Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Hoạt động của {selectedUser.name}</h3>
                  <p className="text-sm text-blue-100">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={closeActivityModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* User Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Tổng chứng chỉ</p>
                  <p className="text-3xl font-bold text-blue-700">{userActivities.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Thành công</p>
                  <p className="text-3xl font-bold text-green-700">
                    {userActivities.filter(c => c.processingStatus === 'completed').length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-600 font-medium">Ngày tham gia</p>
                  <p className="text-sm font-bold text-purple-700">
                    {new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Activities List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử xử lý chứng chỉ</h4>
                
                {loadingActivities ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Đang tải...</p>
                  </div>
                ) : userActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có hoạt động nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userActivities.map((cert) => (
                      <div key={cert._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">{cert.fileName}</p>
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
                              </div>
                              <div className="mt-1 space-y-1">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Loại:</span> {cert.certificateType}
                                </p>
                                {cert.extractedData?.fullName && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Họ tên:</span> {cert.extractedData.fullName}
                                  </p>
                                )}
                                {cert.extractedData?.certificateNumber && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Số chứng chỉ:</span> {cert.extractedData.certificateNumber}
                                  </p>
                                )}
                                {cert.extractedData?.scores?.overall && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Điểm:</span> {cert.extractedData.scores.overall}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(cert.createdAt).toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={closeActivityModal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}