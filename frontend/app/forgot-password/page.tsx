'use client'

import { useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason: 'Quên mật khẩu' })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSent(true)
      } else {
        // Hiển thị thông báo lỗi chi tiết
        const errorMessage = data.message || 'Có lỗi xảy ra khi gửi yêu cầu'
        alert(`❌ ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Không thể kết nối đến server. Vui lòng kiểm tra:\n\n1. Server đã chạy chưa? (npm run dev trong thư mục server)\n2. Kết nối mạng có ổn định không?\n3. URL server có đúng không? (http://localhost:5000)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <span className="text-3xl font-bold text-primary-600">CertExtract</span>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Quên mật khẩu?</h2>
                <p className="text-gray-600 mt-2">
                  Nhập email đã đăng ký. Yêu cầu sẽ được gửi đến admin để phê duyệt.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Đang gửi...' : 'Gửi yêu cầu đến admin'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  ← Quay lại trang chủ
                </a>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu đã được gửi!</h2>
              <p className="text-gray-600 mb-4">
                Yêu cầu đặt lại mật khẩu cho <strong>{email}</strong> đã được gửi đến admin.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>📋 Quy trình:</strong>
                </p>
                <ol className="text-sm text-blue-700 text-left mt-2 space-y-1 ml-4">
                  <li>1. Admin sẽ xem xét yêu cầu của bạn</li>
                  <li>2. Nếu được phê duyệt, bạn sẽ nhận được link đặt lại mật khẩu</li>
                  <li>3. Link có hiệu lực trong 24 giờ</li>
                </ol>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Vui lòng kiểm tra email hoặc liên hệ admin nếu cần hỗ trợ
              </p>
              <a
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Quay lại trang chủ
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
