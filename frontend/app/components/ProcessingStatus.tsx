'use client'

import { useState, useEffect } from 'react'

interface ProcessingStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  duration?: number
}

interface ProcessingStatusProps {
  currentStep: string
  progress: number
  method?: 'ai-api' | 'tesseract' | 'hybrid'
}

export default function ProcessingStatus({ currentStep, progress, method = 'hybrid' }: ProcessingStatusProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'validate', name: 'Kiểm tra chất lượng ảnh', status: 'pending' },
    { id: 'gemini', name: 'Gemini AI 2.5 Flash', status: 'pending' },
    { id: 'preprocess', name: 'Tiền xử lý ảnh', status: 'pending' },
    { id: 'ocr', name: 'Tesseract OCR', status: 'pending' },
    { id: 'extract', name: 'Trích xuất thông tin', status: 'pending' },
    { id: 'merge', name: 'Tổng hợp kết quả', status: 'pending' }
  ])

  useEffect(() => {
    setSteps(prevSteps => 
      prevSteps.map(step => {
        if (currentStep.toLowerCase().includes(step.id) || 
            currentStep.toLowerCase().includes(step.name.toLowerCase())) {
          return { ...step, status: 'processing' as const }
        }
        
        // Mark previous steps as completed
        const stepIndex = prevSteps.findIndex(s => s.id === step.id)
        const currentIndex = prevSteps.findIndex(s => 
          currentStep.toLowerCase().includes(s.id) || 
          currentStep.toLowerCase().includes(s.name.toLowerCase())
        )
        
        if (stepIndex < currentIndex) {
          return { ...step, status: 'completed' as const }
        }
        
        return step
      })
    )
  }, [currentStep])

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅'
      case 'processing':
        return '⚡'
      case 'failed':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStepColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getMethodInfo = () => {
    switch (method) {
      case 'ai-api':
        return { name: 'Gemini AI 2.5 Flash', color: 'from-blue-500 to-blue-600', icon: '🤖' }
      case 'tesseract':
        return { name: 'Tesseract OCR', color: 'from-green-500 to-green-600', icon: '🔍' }
      default:
        return { name: 'Hybrid AI + OCR', color: 'from-purple-500 to-purple-600', icon: '🔀' }
    }
  }

  const methodInfo = getMethodInfo()

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-r ${methodInfo.color} rounded-lg flex items-center justify-center shadow-md`}>
            <span className="text-xl">{methodInfo.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Đang xử lý với {methodInfo.name}</h3>
            <p className="text-sm text-gray-600">{currentStep}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(progress * 100)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${getStepColor(step.status)}`}
          >
            <span className="text-lg">{getStepIcon(step.status)}</span>
            <div className="flex-1">
              <p className="font-medium">{step.name}</p>
              {step.status === 'processing' && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            {step.duration && (
              <span className="text-xs text-gray-500">{step.duration}s</span>
            )}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">Đang xử lý...</p>
            <p className="text-xs text-blue-700 mt-1">
              Hệ thống đang sử dụng AI để trích xuất thông tin chính xác nhất từ chứng chỉ của bạn.
              Quá trình này có thể mất 5-15 giây tùy thuộc vào chất lượng ảnh.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}