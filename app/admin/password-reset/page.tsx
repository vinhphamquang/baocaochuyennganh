'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface PasswordResetRequest {
  _id: string
  userId: {
    _id: string
    fullName: string
    email: string
  }
  email: string
  fullName: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: {
    fullName: string
    email: string
  }
  reviewNote?: string
  resetToken?: string
  tokenExpiresAt?: string
}

export default function PasswordResetManagementPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [allRequests, setAllRequests] = useState<PasswordResetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [processing, setProcessing] = useState(false)
  const [resetLink, setResetLink] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [filter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/admin')
        return
      }

      // Fetch all requests for counting
      const allResponse = await fetch(`http://localhost:5000/api/admin/password-reset-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (allResponse.ok) {
        const allData = await allResponse.json()
        setAllRequests(allData.requests || [])
      }

      // Fetch filtered requests
      const queryParam = filter !== 'all' ? `?status=${filter}` : ''
      const response = await fetch(`http://localhost:5000/api/admin/password-reset-requests${queryParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Fetch requests error:', error)
      toast.error('Không thể tải danh sách yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  // Count requests by status
  const getCountByStatus = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    if (status === 'all') return allRequests.length
    return allRequests.filter(req => req.status === status).length
  }

  const handleApprove = async (request: PasswordResetRequest) => {
    setSelectedRequest(request)
    setReviewNote('')
    setShowModal(true)
  }

  const confirmApprove = async () => {
    if (!selectedRequest) return

    try {
      setProcessing(true)
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/admin/password-reset-requests/${selectedRequest._id}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reviewNote })
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success('Đã phê duyệt yêu cầu!')
        setResetLink(data.resetLink)
        fetchRequests()
      } else {
        toast.error(data.message || 'Lỗi khi phê duyệt')
      }
    } catch (error) {
      console.error('Approve error:', error)
      toast.error('Lỗi kết nối')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (request: PasswordResetRequest) => {
    const note = prompt('Nhập lý do từ chối (tùy chọn):')
    
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://localhost:5000/api/admin/password-reset-requests/${request._id}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reviewNote: note || 'Từ chối yêu cầu' })
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success('Đã từ chối yêu cầu')
        fetchRequests()
      } else {
        toast.error(data.message || 'Lỗi khi từ chối')
      }
    } catch (error) {
      console.error('Reject error:', error)
      toast.error('Lỗi kết nối')
    }
  }

  const copyResetLink = () => {
    navigator.clipboard.writeText(resetLink)
    toast.success('Đã sao chép link!')
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRequest(null)
    setReviewNote('')
    setResetLink('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">⏳ Chờ xử lý</span>
      case 'approved':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">✅ Đã phê duyệt</span>
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">❌ Đã từ chối</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🔐 Quản lý yêu cầu đặt lại mật khẩu</h1>
              <p className="mt-1 text-sm text-gray-500">Phê duyệt hoặc từ chối yêu cầu từ người dùng</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' && '📋 Tất cả'}
              {status === 'pending' && '⏳ Chờ xử lý'}
              {status === 'approved' && '✅ Đã phê duyệt'}
              {status === 'rejected' && '❌ Đã từ chối'}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-20">
                {getCountByStatus(status)}
              </span>
            </button>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có yêu cầu nào</h3>
            <p className="text-gray-500">Chưa có yêu cầu đặt lại mật khẩu {filter !== 'all' && `ở trạng thái "${filter}"`}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {request.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.fullName}</h3>
                        <p className="text-sm text-gray-500">{request.email}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>Lý do:</strong> {request.reason}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Yêu cầu lúc:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(request.requestedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {request.reviewedAt && (
                        <div>
                          <span className="text-gray-500">Xử lý lúc:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(request.reviewedAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {request.reviewedBy && (
                        <div>
                          <span className="text-gray-500">Xử lý bởi:</span>
                          <p className="font-medium text-gray-900">{request.reviewedBy.fullName}</p>
                        </div>
                      )}
                      {request.reviewNote && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Ghi chú:</span>
                          <p className="font-medium text-gray-900">{request.reviewNote}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(request)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                      >
                        ✅ Phê duyệt
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {resetLink ? '✅ Đã phê duyệt' : '🔐 Phê duyệt yêu cầu'}
              </h3>
            </div>

            <div className="p-6">
              {!resetLink ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Bạn đang phê duyệt yêu cầu đặt lại mật khẩu cho:
                    </p>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-900">{selectedRequest.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedRequest.email}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Nhập ghi chú về việc phê duyệt..."
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-2">
                      ✅ Yêu cầu đã được phê duyệt thành công!
                    </p>
                    <p className="text-xs text-green-700">
                      📧 Email với link đặt lại mật khẩu đã được gửi đến người dùng
                    </p>
                    <p className="text-xs text-green-700">
                      ⏰ Link có hiệu lực trong 24 giờ
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link đặt lại mật khẩu (backup):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resetLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-900"
                      />
                      <button
                        onClick={copyResetLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      💡 Người dùng đã nhận email tự động. Chỉ cần gửi link này nếu họ không nhận được email.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {!resetLink ? (
                <>
                  <button
                    onClick={closeModal}
                    disabled={processing}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmApprove}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    {processing ? 'Đang xử lý...' : '✅ Xác nhận phê duyệt'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
