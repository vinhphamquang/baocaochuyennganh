'use client'

import { useState } from 'react'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Certificate {
  _id: string
  fileName: string
  certificateType: string
  processingStatus: string
  extractedData?: {
    fullName?: string
    dateOfBirth?: string
    certificateNumber?: string
    examDate?: string
    issueDate?: string
    scores?: {
      listening?: string
      reading?: string
      writing?: string
      speaking?: string
      overall?: string
    }
  }
  createdAt: string
}

interface CertificateDetailProps {
  certificate: Certificate
  onClose: () => void
  onUpdate: () => void
}

export default function CertificateDetail({ certificate, onClose, onUpdate }: CertificateDetailProps) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: certificate.extractedData?.fullName || '',
    dateOfBirth: certificate.extractedData?.dateOfBirth || '',
    certificateNumber: certificate.extractedData?.certificateNumber || '',
    examDate: certificate.extractedData?.examDate || '',
    issueDate: certificate.extractedData?.issueDate || '',
    listening: certificate.extractedData?.scores?.listening || '',
    reading: certificate.extractedData?.scores?.reading || '',
    writing: certificate.extractedData?.scores?.writing || '',
    speaking: certificate.extractedData?.scores?.speaking || '',
    overall: certificate.extractedData?.scores?.overall || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/certificates/${certificate._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          extractedData: {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            certificateNumber: formData.certificateNumber,
            examDate: formData.examDate,
            issueDate: formData.issueDate,
            scores: {
              listening: formData.listening,
              reading: formData.reading,
              writing: formData.writing,
              speaking: formData.speaking,
              overall: formData.overall
            }
          }
        })
      })

      if (response.ok) {
        toast.success('Cập nhật thành công!')
        setEditing(false)
        onUpdate()
      } else {
        toast.error('Cập nhật thất bại')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Lỗi khi cập nhật')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Chi tiết chứng chỉ</h2>
              <p className="text-sm text-gray-500 mt-1">{certificate.fileName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Status */}
          <div className="mb-6">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              certificate.processingStatus === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : certificate.processingStatus === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {certificate.processingStatus === 'completed' ? '✓ Đã xử lý' : 
               certificate.processingStatus === 'processing' ? '⏳ Đang xử lý' : '✗ Thất bại'}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin cá nhân</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="text"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Certificate Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin chứng chỉ</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số chứng chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({...formData, certificateNumber: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại chứng chỉ
                  </label>
                  <input
                    type="text"
                    value={certificate.certificateType}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày thi
                  </label>
                  <input
                    type="text"
                    value={formData.examDate}
                    onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày cấp
                  </label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Scores */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Điểm số</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Listening
                  </label>
                  <input
                    type="text"
                    value={formData.listening}
                    onChange={(e) => setFormData({...formData, listening: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reading
                  </label>
                  <input
                    type="text"
                    value={formData.reading}
                    onChange={(e) => setFormData({...formData, reading: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Writing
                  </label>
                  <input
                    type="text"
                    value={formData.writing}
                    onChange={(e) => setFormData({...formData, writing: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speaking
                  </label>
                  <input
                    type="text"
                    value={formData.speaking}
                    onChange={(e) => setFormData({...formData, speaking: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tổng điểm / Overall
                  </label>
                  <input
                    type="text"
                    value={formData.overall}
                    onChange={(e) => setFormData({...formData, overall: e.target.value})}
                    disabled={!editing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50 disabled:text-gray-600 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center space-x-2"
                >
                  <CheckIcon className="h-5 w-5" />
                  <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <PencilIcon className="h-5 w-5" />
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
