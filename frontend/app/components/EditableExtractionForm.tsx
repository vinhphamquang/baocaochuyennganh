'use client'

import { useState, useEffect } from 'react'
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
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
  confidence?: number
  extractionMethod?: 'tesseract' | 'ai-api' | 'hybrid'
  processingTime?: number
}

interface EditableExtractionFormProps {
  data: ExtractedData
  onDataChange: (newData: ExtractedData) => void
  onSave: () => void
  onExport: (format: 'json' | 'csv' | 'excel') => void
}

export default function EditableExtractionForm({ 
  data, 
  onDataChange, 
  onSave, 
  onExport 
}: EditableExtractionFormProps) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [localData, setLocalData] = useState<ExtractedData>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue)
  }

  const handleSave = (field: string) => {
    const updatedData = { ...localData }
    
    if (field.includes('.')) {
      // Handle nested fields like scores.listening
      const [parent, child] = field.split('.')
      if (parent === 'scores') {
        updatedData.scores = {
          ...updatedData.scores,
          [child]: editValue
        }
      }
    } else {
      // Handle top-level fields
      (updatedData as any)[field] = editValue
    }
    
    setLocalData(updatedData)
    onDataChange(updatedData)
    setEditingField(null)
    setEditValue('')
    toast.success('Đã cập nhật thông tin')
  }

  const handleCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  const renderEditableField = (
    label: string,
    field: string,
    value: string,
    placeholder?: string,
    type: 'text' | 'select' = 'text',
    options?: string[],
    isHighlight: boolean = false,
    icon?: string
  ) => {
    const isEditing = editingField === field
    const hasValue = value && value.trim() !== ''

    return (
      <div className={`space-y-3 ${isHighlight ? 'p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-md' : ''}`}>
        <label className={`block font-bold flex items-center gap-2 ${
          isHighlight ? 'text-blue-900 text-lg' : 'text-gray-800 text-base'
        }`}>
          {icon && <span className="text-lg">{icon}</span>}
          {label}
          {hasValue && <span className="text-green-500 text-xs">✓</span>}
        </label>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              {type === 'select' ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-base text-gray-900 font-medium"
                >
                  <option value="" className="text-gray-500">Chọn loại chứng chỉ</option>
                  {options?.map((option) => (
                    <option key={option} value={option} className="text-gray-900 font-medium">
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-base text-gray-900 font-medium placeholder-gray-400"
                  autoFocus
                />
              )}
              <button
                onClick={() => handleSave(field)}
                className="p-3 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-md hover:shadow-lg"
                title="Lưu"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-3 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md hover:shadow-lg"
                title="Hủy"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <div className={`flex-1 px-4 py-3 rounded-lg min-h-[48px] flex items-center transition-all ${
                hasValue 
                  ? isHighlight 
                    ? 'bg-white border-2 border-blue-300 shadow-md'
                    : 'bg-white border-2 border-gray-200 shadow-sm'
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}>
                <span className={`${
                  hasValue 
                    ? isHighlight 
                      ? 'text-blue-900 font-bold text-lg'
                      : 'text-gray-900 font-semibold text-base'
                    : 'text-gray-500 font-normal text-base'
                }`}>
                  {value || placeholder || 'Chưa có thông tin'}
                </span>
              </div>
              <button
                onClick={() => handleEdit(field, value)}
                className={`p-3 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  isHighlight 
                    ? 'text-white bg-blue-500 hover:bg-blue-600' 
                    : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                }`}
                title="Chỉnh sửa"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const certificateTypes = ['IELTS', 'TOEIC', 'TOEFL', 'VSTEP', 'HSK', 'JLPT', 'OTHER']

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-8">
      {/* Header với animation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Thông tin trích xuất được
            </h3>
            <p className="text-sm text-gray-600">
              Click vào ✏️ để chỉnh sửa thông tin nếu cần
            </p>
          </div>
        </div>
        
        {/* Confidence Badge */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700">Độ tin cậy</div>
            <div className={`text-2xl font-bold ${
              (localData.confidence || 0) >= 80 ? 'text-green-600' : 
              (localData.confidence || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {localData.confidence || 0}%
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full shadow-lg ${
            (localData.confidence || 0) >= 80 ? 'bg-green-500' : 
            (localData.confidence || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Thông tin cơ bản */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">📋</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900">Thông tin cơ bản</h4>
          </div>
          
          {/* Họ và tên - Highlighted */}
          {renderEditableField(
            'Họ và tên',
            'fullName',
            localData.fullName,
            'Nhập họ và tên đầy đủ',
            'text',
            undefined,
            true,
            '👤'
          )}

          {renderEditableField(
            'Loại chứng chỉ',
            'certificateType',
            localData.certificateType,
            'Chọn loại chứng chỉ',
            'select',
            certificateTypes,
            false,
            '🎓'
          )}

          {renderEditableField(
            'Số chứng chỉ',
            'certificateNumber',
            localData.certificateNumber,
            'Nhập số chứng chỉ',
            'text',
            undefined,
            false,
            '🔢'
          )}

          {renderEditableField(
            'Ngày sinh',
            'dateOfBirth',
            localData.dateOfBirth,
            'DD/MM/YYYY',
            'text',
            undefined,
            false,
            '📅'
          )}

          {renderEditableField(
            'Ngày thi',
            'testDate',
            localData.testDate,
            'DD/MM/YYYY',
            'text',
            undefined,
            false,
            '📝'
          )}

          {renderEditableField(
            'Ngày cấp',
            'issueDate',
            localData.issueDate,
            'DD/MM/YYYY',
            'text',
            undefined,
            false,
            '✅'
          )}

          {renderEditableField(
            'Tổ chức cấp',
            'issuingOrganization',
            localData.issuingOrganization,
            'Tên tổ chức cấp chứng chỉ',
            'text',
            undefined,
            false,
            '🏢'
          )}
        </div>

        {/* Điểm số */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⭐</span>
            </div>
            <h4 className="text-xl font-bold text-gray-900">Điểm số chi tiết</h4>
          </div>
          
          {/* Điểm tổng - Highlighted */}
          {renderEditableField(
            'Điểm tổng',
            'scores.overall',
            localData.scores.overall,
            'Điểm tổng',
            'text',
            undefined,
            true,
            '🏆'
          )}

          {renderEditableField(
            'Nghe (Listening)',
            'scores.listening',
            localData.scores.listening,
            'Điểm nghe',
            'text',
            undefined,
            false,
            '🎧'
          )}

          {renderEditableField(
            'Đọc (Reading)',
            'scores.reading',
            localData.scores.reading,
            'Điểm đọc',
            'text',
            undefined,
            false,
            '📖'
          )}

          {renderEditableField(
            'Viết (Writing)',
            'scores.writing',
            localData.scores.writing,
            'Điểm viết',
            'text',
            undefined,
            false,
            '✍️'
          )}

          {renderEditableField(
            'Nói (Speaking)',
            'scores.speaking',
            localData.scores.speaking,
            'Điểm nói',
            'text',
            undefined,
            false,
            '🗣️'
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 pt-8 border-t-2 border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Save Button - Primary */}
          <button
            onClick={onSave}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Lưu vào lịch sử
          </button>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onExport('json')}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              📄 JSON
            </button>
            <button
              onClick={() => onExport('csv')}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              📊 CSV
            </button>
            <button
              onClick={() => onExport('excel')}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              📈 Excel
            </button>
          </div>
        </div>
      </div>

      {/* Thông tin bổ sung */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">ℹ️</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900">Phương thức trích xuất:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-bold text-sm">
                {localData.extractionMethod || 'Unknown'}
              </span>
            </div>
            {localData.processingTime && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">Thời gian xử lý:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-md font-bold text-sm">
                  {localData.processingTime}s
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
              <span className="text-xl">💡</span>
              <span className="text-blue-800 font-bold text-sm">
                Click vào biểu tượng ✏️ để chỉnh sửa thông tin nếu cần
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}