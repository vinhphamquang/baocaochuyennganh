'use client'

import { useState, useEffect } from 'react'
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import DeleteUserModal from '@/app/components/DeleteUserModal'
import ReportUserModal from '@/app/components/ReportUserModal'

interface User {
  _id: string
  fullName: string
  email: string
  createdAt: string
  certificatesProcessed: number
  isActive: boolean
  role: string
}

interface Certificate {
  _id: string
  userId: string | { _id: string; fullName: string; email: string }
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
  type: 'user_register' | 'user_login' | 'user_logout' | 'user_profile_update' | 
        'certificate_upload' | 'certificate_process' | 'certificate_download' | 'certificate_delete' |
        'comment_create' | 'comment_update' | 'comment_delete' |
        'user_report' | 'account_lock' | 'account_unlock' | 'user_delete' |
        'admin_action' | 'system_error' | 'security_alert' |
        'info' | 'warning' | 'error'
  message: string
  adminName?: string
  targetUserName?: string
  targetUserEmail?: string
  details?: {
    reason?: string
    commentContent?: string
    commentId?: string
    previousStatus?: string
    newStatus?: string
    additionalInfo?: any
  }
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

interface AdminComment {
  _id: string
  userId: string
  userName: string
  userEmail: string
  content: string
  rating: number
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

interface CertificateTemplate {
  _id: string
  name: string
  certificateType: string
  description: string
  patterns: {
    namePatterns: Array<{ pattern: string; description: string; priority: number }>
    dobPatterns: Array<{ pattern: string; description: string; priority: number }>
    certificateNumberPatterns: Array<{ pattern: string; description: string; priority: number }>
    examDatePatterns: Array<{ pattern: string; description: string; priority: number }>
    scorePatterns: Array<{ 
      skill: string
      pattern: string
      description: string
      minScore: number
      maxScore: number
      priority: number
    }>
  }
  scoreConfig: {
    skills: string[]
    hasOverall: boolean
    hasTotal: boolean
    minScore: number
    maxScore: number
    scoreType: 'decimal' | 'integer'
  }
  usage: {
    totalProcessed: number
    successfulExtractions: number
    lastUsed?: string
    averageConfidence: number
  }
  isActive: boolean
  version: string
  createdAt: string
  updatedAt: string
}

interface ReportData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsersInPeriod: number
    totalCertificates: number
    certificatesInPeriod: number
    completedCertificates: number
    failedCertificates: number
    successRate: number
  }
  certificatesByType: Array<{ _id: string; count: number }>
  dailyStats: Array<{
    date: string
    processed: number
    completed: number
    successRate: number
  }>
  topUsers: Array<{
    userId: string
    fullName: string
    email: string
    certificatesProcessed: number
  }>
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'certificates' | 'templates' | 'reports' | 'comments' | 'logs'>('overview')
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
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [comments, setComments] = useState<AdminComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentToReport, setCommentToReport] = useState<AdminComment | null>(null)
  const [isReporting, setIsReporting] = useState(false)
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loadingReports, setLoadingReports] = useState(false)
  
  // Template interaction states
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    certificateType: 'IELTS',
    description: ''
  })
  
  // Report interaction states
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    certificateType: '',
    status: ''
  })
  const [realtimeData, setRealtimeData] = useState<any>(null)

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

      // Fetch comments
      const commentsRes = await fetch('http://localhost:5000/api/comments/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.data)
      }

      // Fetch templates
      const templatesRes = await fetch('http://localhost:5000/api/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json()
        setTemplates(templatesData.data)
      }

      // Fetch reports
      const reportsRes = await fetch('http://localhost:5000/api/reports/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReportData(reportsData.data)
      }

      // Fetch logs
      const logsRes = await fetch('http://localhost:5000/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData.logs)
      }

    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Template management functions
  const handleCreateTemplate = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateForm)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Tạo template thành công!')
        setShowTemplateModal(false)
        setTemplateForm({ name: '', certificateType: 'IELTS', description: '' })
        fetchData() // Reload templates
      } else {
        toast.error('Lỗi khi tạo template')
      }
    } catch (error) {
      console.error('Create template error:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleEditTemplate = (template: CertificateTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      certificateType: template.certificateType,
      description: template.description
    })
    setShowTemplateModal(true)
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/templates/${editingTemplate._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateForm)
      })

      if (response.ok) {
        toast.success('Cập nhật template thành công!')
        setShowTemplateModal(false)
        setEditingTemplate(null)
        setTemplateForm({ name: '', certificateType: 'IELTS', description: '' })
        fetchData() // Reload templates
      } else {
        toast.error('Lỗi khi cập nhật template')
      }
    } catch (error) {
      console.error('Update template error:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Bạn có chắc muốn xóa template này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Xóa template thành công!')
        fetchData() // Reload templates
      } else {
        toast.error('Lỗi khi xóa template')
      }
    } catch (error) {
      console.error('Delete template error:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleToggleTemplate = async (templateId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/templates/${templateId}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        fetchData() // Reload templates
      } else {
        toast.error('Lỗi khi thay đổi trạng thái')
      }
    } catch (error) {
      console.error('Toggle template error:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const handleTestTemplate = async (templateId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/templates/${templateId}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Test thành công! Độ chính xác: ${result.data.confidence}%`)
      } else {
        toast.error('Lỗi khi test template')
      }
    } catch (error) {
      console.error('Test template error:', error)
      toast.error('Lỗi kết nối')
    }
  }

  // Report functions
  const handleApplyFilters = async () => {
    try {
      const token = localStorage.getItem('token')
      const queryParams = new URLSearchParams(reportFilters).toString()
      const response = await fetch(`http://localhost:5000/api/reports/overview?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        setReportData(result.data)
        toast.success('Đã áp dụng bộ lọc')
      }
    } catch (error) {
      console.error('Apply filters error:', error)
      toast.error('Lỗi khi áp dụng bộ lọc')
    }
  }

  const handleExportReport = async (reportType: string, format: string = 'json') => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/reports/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType,
          format,
          filters: reportFilters
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}_report.${format}`
        a.click()
        toast.success('Xuất báo cáo thành công!')
      }
    } catch (error) {
      console.error('Export report error:', error)
      toast.error('Lỗi khi xuất báo cáo')
    }
  }

  // Fetch realtime data
  const fetchRealtimeData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/reports/realtime', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const result = await response.json()
        setRealtimeData(result.data)
      }
    } catch (error) {
      console.error('Fetch realtime data error:', error)
    }
  }

  // Auto-refresh realtime data
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchRealtimeData()
      const interval = setInterval(fetchRealtimeData, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [activeTab])

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
    setIsDeleting(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          `✅ Đã xóa tài khoản "${result.deletedUser.fullName}" và ${result.deletedCertificatesCount} chứng chỉ`,
          { duration: 5000 }
        )
        fetchData() // Reload data
      } else {
        toast.error(`❌ ${result.message || 'Lỗi khi xóa người dùng'}`)
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('❌ Lỗi kết nối khi xóa người dùng')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteModal = (user: User) => {
    setUserToDelete(user)
  }

  const closeDeleteModal = () => {
    setUserToDelete(null)
  }

  const handleReportUser = async (commentId: string, reason: string) => {
    setIsReporting(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/report-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`🚨 Đã báo cáo tài khoản ${result.data.reportedUser}`, { duration: 3000 })
        return result.data
      } else {
        toast.error('Lỗi khi báo cáo tài khoản')
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Report user error:', error)
      toast.error('Lỗi khi báo cáo tài khoản')
      throw error
    } finally {
      setIsReporting(false)
    }
  }

  const handleLockAccountFromReport = async (userId: string) => {
    const userToLock = users.find(u => u._id === userId)
    if (!userToLock) {
      toast.error('❌ Không tìm thấy tài khoản để khóa')
      return
    }

    if (!userToLock.isActive) {
      toast('ℹ️ Tài khoản này đã bị khóa trước đó', { 
        icon: 'ℹ️',
        style: { background: '#e0f2fe', color: '#0369a1' }
      })
      return
    }

    await handleToggleUserStatus(userId, true) // true = isActive hiện tại, sẽ chuyển thành false
  }

  const openReportModal = (comment: AdminComment) => {
    setCommentToReport(comment)
  }

  const closeReportModal = () => {
    setCommentToReport(null)
  }

  const handleDeleteComment = async (commentId: string) => {
    const comment = comments.find(c => c._id === commentId)
    if (!comment) return

    const confirmMessage = `⚠️ Bạn có chắc muốn xóa bình luận này?\n\n` +
      `👤 Người dùng: ${comment.userName}\n` +
      `📧 Email: ${comment.userEmail}\n` +
      `💬 Nội dung: ${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}\n` +
      `⭐ Đánh giá: ${comment.rating}/5 sao\n\n` +
      `Hành động này không thể hoàn tác.`

    if (!confirm(confirmMessage)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Đã xóa bình luận')
        fetchData() // Reload data
      } else {
        toast.error('Lỗi khi xóa bình luận')
      }
    } catch (error) {
      console.error('Delete comment error:', error)
      toast.error('Lỗi khi xóa bình luận')
    }
  }

  const viewUserActivities = async (user: User) => {
    console.log('👤 Viewing activities for user:', user)
    console.log('📋 All certificates:', certificates)
    
    setSelectedUser(user)
    setLoadingActivities(true)
    
    try {
      // Lọc chứng chỉ của user này
      // Backend populate userId nên có thể là object {_id, fullName, email} hoặc string
      const userCerts = certificates.filter(cert => {
        if (typeof cert.userId === 'object' && cert.userId !== null) {
          // userId là object đã được populate
          const match = cert.userId._id === user._id
          console.log(`Object compare: ${cert.userId._id} === ${user._id} = ${match}`)
          return match
        } else {
          // userId là string
          const match = cert.userId === user._id
          console.log(`String compare: ${cert.userId} === ${user._id} = ${match}`)
          return match
        }
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CogIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Tài khoản Admin mặc định
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>📧 Email: <code className="bg-blue-100 px-1 rounded">admin@certificateextraction.com</code></p>
                    <p>🔒 Mật khẩu: <code className="bg-blue-100 px-1 rounded">admin123456</code></p>
                  </div>
                </div>
              </div>
            </div>
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
    { id: 'templates', name: 'Mẫu chứng chỉ', icon: DocumentTextIcon },
    { id: 'reports', name: 'Báo cáo', icon: ChartBarIcon },
    { id: 'comments', name: 'Bình luận', icon: ChatBubbleLeftRightIcon },
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

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium mb-1">Tổng bình luận</p>
                    <p className="text-4xl font-bold">{comments?.length || 0}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-4">
                    <ChatBubbleLeftRightIcon className="h-8 w-8" />
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
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => viewUserActivities(user)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                            title="Xem hoạt động"
                          >
                            👁️ Xem
                          </button>
                          <button 
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            className={`font-medium ${
                              user.isActive 
                                ? 'text-orange-600 hover:text-orange-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            {user.isActive ? '🔒 Khóa' : '✅ Kích hoạt'}
                          </button>
                          {user.role !== 'admin' && (
                            <button 
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 hover:text-red-900 font-medium"
                              title="Xóa tài khoản"
                            >
                              🗑️ Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">💬 Quản lý bình luận</h2>
              <p className="text-sm text-gray-600 mt-1">Duyệt và quản lý bình luận của người dùng</p>
            </div>
            
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có bình luận nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {comments.map((comment) => (
                  <div key={comment._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {comment.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{comment.userName}</p>
                            <p className="text-sm text-gray-500">{comment.userEmail}</p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < comment.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {comment.rating}/5 sao
                          </span>
                        </div>

                        {/* Comment Content */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>📅 {new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            💬 Bình luận công khai
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => openReportModal(comment)}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                        >
                          🚨 Báo cáo
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab - System Activity Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📋 Nhật ký hệ thống</h2>
              <p className="text-sm text-gray-600 mt-1">Lịch sử hoạt động và thay đổi của admin</p>
            </div>
            <div className="p-6">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <CogIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => {
                    const logDate = new Date(log.timestamp)
                    const now = new Date()
                    const diffTime = Math.abs(now.getTime() - logDate.getTime())
                    const diffMinutes = Math.floor(diffTime / (1000 * 60))
                    const diffHours = Math.floor(diffMinutes / 60)
                    const diffDays = Math.floor(diffHours / 24)
                    
                    let timeAgo = ''
                    if (diffDays > 0) {
                      timeAgo = `${diffDays} ngày trước`
                    } else if (diffHours > 0) {
                      timeAgo = `${diffHours} giờ trước`
                    } else if (diffMinutes > 0) {
                      timeAgo = `${diffMinutes} phút trước`
                    } else {
                      timeAgo = 'Vừa xong'
                    }

                    const getLogIcon = (type: string) => {
                      switch (type) {
                        case 'user_register': return '👤'
                        case 'user_login': return '🔑'
                        case 'user_logout': return '🚪'
                        case 'user_profile_update': return '✏️'
                        case 'certificate_upload': return '📤'
                        case 'certificate_process': return '⚙️'
                        case 'certificate_download': return '📥'
                        case 'certificate_delete': return '🗂️'
                        case 'comment_create': return '💬'
                        case 'comment_update': return '📝'
                        case 'comment_delete': return '🗨️'
                        case 'user_report': return '🚨'
                        case 'account_lock': return '🔒'
                        case 'account_unlock': return '🔓'
                        case 'user_delete': return '🗑️'
                        case 'admin_action': return '👨‍💼'
                        case 'system_error': return '❌'
                        case 'security_alert': return '🛡️'
                        case 'warning': return '⚠️'
                        case 'error': return '❌'
                        default: return 'ℹ️'
                      }
                    }

                    const getLogColor = (severity: string) => {
                      switch (severity) {
                        case 'critical': return 'bg-red-50 border-red-200'
                        case 'high': return 'bg-orange-50 border-orange-200'
                        case 'medium': return 'bg-yellow-50 border-yellow-200'
                        case 'low': return 'bg-blue-50 border-blue-200'
                        default: return 'bg-gray-50 border-gray-200'
                      }
                    }

                    const getLogTextColor = (severity: string) => {
                      switch (severity) {
                        case 'critical': return 'text-red-800'
                        case 'high': return 'text-orange-800'
                        case 'medium': return 'text-yellow-800'
                        case 'low': return 'text-blue-800'
                        default: return 'text-gray-800'
                      }
                    }

                    return (
                      <div key={log.id} className={`p-4 rounded-lg border-l-4 ${getLogColor(log.severity || 'low')}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-lg">{getLogIcon(log.type)}</span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <p className={`text-sm font-semibold ${getLogTextColor(log.severity || 'low')}`}>
                                  {log.message}
                                </p>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${
                                  log.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                  log.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                  log.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-blue-200 text-blue-800'
                                }`}>
                                  {log.severity?.toUpperCase() || 'LOW'}
                                </span>
                              </div>

                              {/* Chi tiết log */}
                              {log.details && (
                                <div className="bg-white rounded-lg p-3 mb-2 text-sm">
                                  {log.details.reason && (
                                    <p><span className="font-medium">📝 Lý do:</span> {log.details.reason}</p>
                                  )}
                                  {log.details.commentContent && (
                                    <p><span className="font-medium">💬 Bình luận:</span> "{log.details.commentContent}"</p>
                                  )}
                                  {log.details.previousStatus && log.details.newStatus && (
                                    <p><span className="font-medium">🔄 Thay đổi:</span> {log.details.previousStatus} → {log.details.newStatus}</p>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>👤 Admin: {log.adminName || 'Hệ thống'}</span>
                                {log.targetUserName && (
                                  <span>🎯 Đối tượng: {log.targetUserName} ({log.targetUserEmail})</span>
                                )}
                                <span>📅 {logDate.toLocaleString('vi-VN')}</span>
                                <span>⏱️ {timeAgo}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🎯 Quản lý mẫu chứng chỉ</h2>
              <p className="text-sm text-gray-600 mt-1">Cập nhật và quản lý các mẫu nhận dạng chứng chỉ</p>
            </div>
            
            <div className="p-6">
              {/* Templates Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Tổng mẫu</p>
                      <p className="text-2xl font-bold text-blue-700">{templates.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Đang hoạt động</p>
                      <p className="text-2xl font-bold text-green-700">
                        {templates.filter(t => t.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Độ chính xác TB</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {templates.length > 0 
                          ? Math.round(templates.reduce((acc, t) => acc + t.usage.averageConfidence, 0) / templates.length)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CogIcon className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Đã xử lý</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {templates.reduce((acc, t) => acc + t.usage.totalProcessed, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Template Button */}
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Danh sách mẫu chứng chỉ</h3>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Thêm mẫu mới
                </button>
              </div>

              {/* Templates List */}
              {templates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mẫu chứng chỉ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hiệu suất
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
                      {templates.map((template) => (
                        <tr key={template._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{template.name}</div>
                              <div className="text-sm text-gray-500">{template.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {template.certificateType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div>Đã xử lý: {template.usage.totalProcessed}</div>
                              <div>Thành công: {template.usage.successfulExtractions}</div>
                              <div>Độ chính xác: {Math.round(template.usage.averageConfidence)}%</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              template.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {template.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => handleEditTemplate(template)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                                title="Chỉnh sửa template"
                              >
                                ✏️ Sửa
                              </button>
                              <button 
                                onClick={() => handleTestTemplate(template._id)}
                                className="text-green-600 hover:text-green-900 font-medium"
                                title="Test template"
                              >
                                🧪 Test
                              </button>
                              <button 
                                onClick={() => handleToggleTemplate(template._id)}
                                className={`font-medium ${
                                  template.isActive 
                                    ? 'text-orange-600 hover:text-orange-900' 
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={template.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                              >
                                {template.isActive ? '⏸️ Dừng' : '▶️ Bật'}
                              </button>
                              <button 
                                onClick={() => handleDeleteTemplate(template._id)}
                                className="text-red-600 hover:text-red-900 font-medium"
                                title="Xóa template"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có mẫu chứng chỉ nào</p>
                  <button 
                    onClick={() => setShowTemplateModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Thêm mẫu mới
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Filters */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Bộ lọc báo cáo</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại chứng chỉ</label>
                  <select
                    value={reportFilters.certificateType}
                    onChange={(e) => setReportFilters({...reportFilters, certificateType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="VSTEP">VSTEP</option>
                    <option value="TOEFL">TOEFL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  🔍 Áp dụng bộ lọc
                </button>
                <button
                  onClick={() => handleExportReport('overview', 'json')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  📊 Xuất JSON
                </button>
                <button
                  onClick={() => handleExportReport('overview', 'csv')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  📋 Xuất CSV
                </button>
              </div>
            </div>

            {/* Realtime Data */}
            {realtimeData && (
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Dữ liệu thời gian thực</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-600">Đang xử lý</p>
                    <p className="text-2xl font-bold text-blue-700">{realtimeData.currentProcessing}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-yellow-600">Hàng đợi</p>
                    <p className="text-2xl font-bold text-yellow-700">{realtimeData.queueLength}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-green-600">User online</p>
                    <p className="text-2xl font-bold text-green-700">{realtimeData.activeUsers}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-purple-600">Tải hệ thống</p>
                    <p className="text-2xl font-bold text-purple-700">{realtimeData.systemLoad}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Cập nhật lần cuối: {new Date(realtimeData.lastUpdated).toLocaleTimeString('vi-VN')}</p>
              </div>
            )}

            {/* Report Header */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Báo cáo thống kê hệ thống</h2>
              
              {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium opacity-90">Tổng người dùng</h3>
                    <p className="text-3xl font-bold">{reportData.overview.totalUsers}</p>
                    <p className="text-sm opacity-75">+{reportData.overview.newUsersInPeriod} mới</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium opacity-90">Chứng chỉ xử lý</h3>
                    <p className="text-3xl font-bold">{reportData.overview.totalCertificates}</p>
                    <p className="text-sm opacity-75">Tỷ lệ thành công: {reportData.overview.successRate}%</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium opacity-90">Hoàn thành</h3>
                    <p className="text-3xl font-bold">{reportData.overview.completedCertificates}</p>
                    <p className="text-sm opacity-75">Trong kỳ báo cáo</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
                    <h3 className="text-sm font-medium opacity-90">Thất bại</h3>
                    <p className="text-3xl font-bold">{reportData.overview.failedCertificates}</p>
                    <p className="text-sm opacity-75">Cần xem xét</p>
                  </div>
                </div>
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Certificate Types Chart */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo loại chứng chỉ</h3>
                {reportData?.certificatesByType && reportData.certificatesByType.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.certificatesByType.map((item, index) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded mr-3"
                            style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                          ></div>
                          <span className="text-sm font-medium">{item._id || 'Khác'}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                )}
              </div>

              {/* Top Users */}
              <div className="bg-white shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top người dùng tích cực</h3>
                {reportData?.topUsers && reportData.topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.topUsers.slice(0, 5).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          {user.certificatesProcessed} chứng chỉ
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            {/* Daily Stats */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê 7 ngày gần nhất</h3>
              {reportData?.dailyStats && reportData.dailyStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Ngày</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Đã xử lý</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Hoàn thành</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600">Tỷ lệ thành công</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.dailyStats.map((day) => (
                        <tr key={day.date} className="border-b">
                          <td className="py-2 text-sm">{new Date(day.date).toLocaleDateString('vi-VN')}</td>
                          <td className="py-2 text-sm">{day.processed}</td>
                          <td className="py-2 text-sm text-green-600">{day.completed}</td>
                          <td className="py-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              day.successRate >= 80 ? 'bg-green-100 text-green-800' :
                              day.successRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {day.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
              )}
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
                  <h3 className="text-xl font-bold text-white">Hoạt động của {selectedUser.fullName}</h3>
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

      {/* Delete User Modal */}
      <DeleteUserModal
        user={userToDelete}
        isOpen={!!userToDelete}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        isLoading={isDeleting}
      />

      {/* Report User Modal */}
      <ReportUserModal
        comment={commentToReport}
        isOpen={!!commentToReport}
        onClose={closeReportModal}
        onReport={handleReportUser}
        onLockAccount={handleLockAccountFromReport}
        isLoading={isReporting}
      />

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? '✏️ Chỉnh sửa mẫu' : '➕ Thêm mẫu mới'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên mẫu</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên mẫu chứng chỉ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại chứng chỉ</label>
                <select
                  value={templateForm.certificateType}
                  onChange={(e) => setTemplateForm({...templateForm, certificateType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="VSTEP">VSTEP</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="HSK">HSK</option>
                  <option value="JLPT">JLPT</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả về mẫu chứng chỉ này"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setEditingTemplate(null)
                  setTemplateForm({ name: '', certificateType: 'IELTS', description: '' })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {editingTemplate ? 'Cập nhật' : 'Tạo mẫu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}