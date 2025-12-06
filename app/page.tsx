'use client'

import { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import UploadSection from './components/UploadSection'
import Features from './components/Features'
import SupportedCertificates from './components/SupportedCertificates'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main>
        <Hero />
        
        {/* Quick Overview Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Tại sao chọn chúng tôi?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Giải pháp toàn diện cho việc quản lý và trích xuất thông tin chứng chỉ
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <a href="/features" className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Tính năng mạnh mẽ</h3>
                <p className="text-gray-600 text-sm">OCR AI, xuất dữ liệu đa dạng, bảo mật cao</p>
              </a>
              
              <a href="/how-it-works" className="group bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-purple-100">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Dễ sử dụng</h3>
                <p className="text-gray-600 text-sm">Quy trình đơn giản chỉ 3 bước</p>
              </a>
              
              <a href="/extract" className="group bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-green-100">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Trích xuất nhanh</h3>
                <p className="text-gray-600 text-sm">Xử lý trong vòng 30 giây</p>
              </a>
              
              <a href="/certificates" className="group bg-gradient-to-br from-pink-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-pink-100">
                <div className="text-4xl mb-4">📜</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">Đa dạng chứng chỉ</h3>
                <p className="text-gray-600 text-sm">IELTS, TOEFL, TOEIC, HSK, JLPT...</p>
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Trải nghiệm công nghệ trích xuất thông tin chứng chỉ tự động ngay hôm nay
            </p>
            <div className="flex items-center justify-center gap-4">
              <a 
                href="/extract" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Trích xuất ngay
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a 
                href="/features" 
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-white border-2 border-white rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Xem tính năng
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}