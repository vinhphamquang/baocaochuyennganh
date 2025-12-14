'use client'

import { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface User {
  _id: string
  fullName: string
  email: string
  certificatesProcessed: number
  role: string
}

interface DeleteUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string) => Promise<void>
  isLoading: boolean
}

export default function DeleteUserModal({ 
  user, 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading 
}: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState('')
  
  if (!isOpen || !user) return null

  const expectedText = 'XÓA VĨNH VIỄN'
  const canDelete = confirmText === expectedText

  const handleConfirm = async () => {
    if (canDelete && user) {
      await onConfirm(user._id)
      setConfirmText('')
      onClose()
    }
  }

  const handleClose = () => {
    setConfirmText('')
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
          
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                ⚠️ Xóa tài khoản người dùng
              </h3>
              
              <div className="mt-4 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Thông tin tài khoản sẽ xóa:</h4>
                  <div className="space-y-1 text-sm text-red-700">
                    <p><span className="font-medium">👤 Tên:</span> {user.fullName}</p>
                    <p><span className="font-medium">📧 Email:</span> {user.email}</p>
                    <p><span className="font-medium">📊 Chứng chỉ:</span> {user.certificatesProcessed}</p>
                    <p><span className="font-medium">🏷️ Vai trò:</span> {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">🚨 Cảnh báo:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Tài khoản sẽ bị xóa vĩnh viễn</li>
                    <li>• Tất cả chứng chỉ của người dùng sẽ bị xóa</li>
                    <li>• Dữ liệu không thể khôi phục</li>
                    <li>• Hành động này không thể hoàn tác</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Để xác nhận xóa, vui lòng nhập chính xác đoạn text sau:
                  </label>
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-3 mb-3 text-center">
                    <span className="font-bold text-lg text-red-600 tracking-wider">{expectedText}</span>
                  </div>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all font-mono text-center text-lg tracking-wider ${
                      confirmText === expectedText 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : confirmText.length > 0 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="Nhập text xác nhận ở đây..."
                    disabled={isLoading}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {confirmText.length > 0 && confirmText !== expectedText && (
                    <p className="text-sm text-red-600 mt-2">
                      ❌ Text chưa chính xác. Vui lòng nhập đúng: <span className="font-bold">{expectedText}</span>
                    </p>
                  )}
                  {confirmText === expectedText && (
                    <p className="text-sm text-green-600 mt-2">
                      ✅ Text xác nhận chính xác. Có thể tiến hành xóa.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canDelete || isLoading}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-3 text-sm font-bold shadow-lg transform transition-all sm:w-auto ${
                canDelete && !isLoading
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 focus:ring-4 focus:ring-red-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              } focus:outline-none`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xóa tài khoản...
                </>
              ) : canDelete ? (
                <>
                  🗑️ XÓA VĨNH VIỄN
                </>
              ) : (
                <>
                  🔒 Nhập text xác nhận để xóa
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-md ring-2 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 transition-all sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}