'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline'

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

interface ReportUserModalProps {
  comment: AdminComment | null
  isOpen: boolean
  onClose: () => void
  onReport: (commentId: string, reason: string) => Promise<void>
  onLockAccount: (userId: string) => Promise<void>
  isLoading: boolean
}

export default function ReportUserModal({ 
  comment, 
  isOpen, 
  onClose, 
  onReport,
  onLockAccount,
  isLoading 
}: ReportUserModalProps) {
  const [reason, setReason] = useState('Vi phạm quy định bình luận')
  const [step, setStep] = useState<'report' | 'confirm-lock'>('report')
  const [reportData, setReportData] = useState<any>(null)
  
  if (!isOpen || !comment) return null

  const handleReport = async () => {
    if (!reason.trim()) return
    
    try {
      await onReport(comment._id, reason.trim())
      // Giả sử onReport trả về data, chúng ta sẽ chuyển sang bước confirm
      setReportData({
        reportedUser: comment.userName,
        userEmail: comment.userEmail,
        reason: reason.trim()
      })
      setStep('confirm-lock')
    } catch (error) {
      console.error('Report error:', error)
    }
  }

  const handleLockAccount = async () => {
    if (reportData) {
      await onLockAccount(comment.userId)
      handleClose()
    }
  }

  const handleClose = () => {
    setReason('Vi phạm quy định bình luận')
    setStep('report')
    setReportData(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-600"
              onClick={handleClose}
              disabled={isLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {step === 'report' ? (
            // Bước 1: Báo cáo
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  🚨 Báo cáo tài khoản người dùng
                </h3>
                
                <div className="mt-4 space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Thông tin tài khoản:</h4>
                    <div className="space-y-1 text-sm text-orange-700">
                      <p><span className="font-medium">👤 Tên:</span> {comment.userName}</p>
                      <p><span className="font-medium">📧 Email:</span> {comment.userEmail}</p>
                      <p><span className="font-medium">⭐ Đánh giá:</span> {comment.rating}/5 sao</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Nội dung bình luận:</h4>
                    <p className="text-sm text-red-700 italic">"{comment.content}"</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do báo cáo:
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Nhập lý do báo cáo..."
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Bước 2: Đề xuất khóa tài khoản
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <LockClosedIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  🔒 Đề xuất khóa tài khoản
                </h3>
                
                <div className="mt-4 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">✅ Báo cáo đã được ghi nhận thành công!</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Thông tin báo cáo:</h4>
                    <div className="space-y-1 text-sm text-yellow-700">
                      <p><span className="font-medium">👤 Tài khoản:</span> {reportData?.reportedUser}</p>
                      <p><span className="font-medium">📧 Email:</span> {reportData?.userEmail}</p>
                      <p><span className="font-medium">📝 Lý do:</span> {reportData?.reason}</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">🔒 Đề xuất hành động:</h4>
                    <p className="text-sm text-red-700">
                      Dựa trên báo cáo vi phạm, hệ thống đề xuất khóa tài khoản này để bảo vệ cộng đồng.
                      Tài khoản bị khóa sẽ không thể đăng nhập và sử dụng dịch vụ.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
            {step === 'report' ? (
              <>
                <button
                  type="button"
                  onClick={handleReport}
                  disabled={!reason.trim() || isLoading}
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto ${
                    reason.trim() && !isLoading
                      ? 'bg-orange-600 text-white hover:bg-orange-500 focus:ring-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang báo cáo...
                    </>
                  ) : (
                    '🚨 Gửi báo cáo'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleLockAccount}
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang khóa...
                    </>
                  ) : (
                    '🔒 Khóa tài khoản'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bỏ qua
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}