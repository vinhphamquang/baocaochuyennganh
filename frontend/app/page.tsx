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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main>
        <Hero />
        
        {/* Quick Overview Section */}
        <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>🚀</span>
                <span>Tại sao chọn chúng tôi?</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl">
                Giải pháp <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">toàn diện</span> cho việc quản lý chứng chỉ
              </h2>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                Trải nghiệm công nghệ trích xuất thông tin chứng chỉ tự động với độ chính xác cao và bảo mật tuyệt đối
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <a href="/features" className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-blue-200 hover:border-blue-300 hover:scale-105 transform overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Tính năng mạnh mẽ</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">OCR AI tiên tiến, xuất dữ liệu đa dạng, bảo mật cao cấp</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a href="/how-it-works" className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-purple-200 hover:border-purple-300 hover:scale-105 transform overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🔧</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Dễ sử dụng</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Quy trình đơn giản chỉ 3 bước, giao diện thân thiện</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a href="/extract" className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-green-200 hover:border-green-300 hover:scale-105 transform overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📤</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">Trích xuất nhanh</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Xử lý trong vòng 30 giây với độ chính xác 99.5%</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a href="/certificates" className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-pink-200 hover:border-pink-300 hover:scale-105 transform overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">📜</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-pink-600 transition-colors">Đa dạng chứng chỉ</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">IELTS, TOEFL, TOEIC, HSK, JLPT và nhiều hơn nữa</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-5 w-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl">
              <span>🎯</span>
              <span>Sẵn sàng trải nghiệm?</span>
            </div>
            
            <h2 className="text-5xl font-black text-white mb-8 lg:text-6xl">
              Sẵn sàng <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">bắt đầu?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Trải nghiệm công nghệ trích xuất thông tin chứng chỉ tự động với <span className="text-cyan-400 font-bold">AI OCR tiên tiến</span> ngay hôm nay. 
              Nhanh chóng, chính xác và hoàn toàn miễn phí!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="/extract" 
                className="group relative inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="h-6 w-6 mr-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span className="relative z-10">Trích xuất ngay</span>
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              
              <a 
                href="/features" 
                className="group inline-flex items-center text-lg font-bold text-white border-2 border-white/30 hover:border-cyan-400 px-10 py-5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xem tính năng
                <svg className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">99.5%</div>
                <div className="text-gray-300 font-medium">Độ chính xác</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">&lt; 30s</div>
                <div className="text-gray-300 font-medium">Thời gian xử lý</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">100%</div>
                <div className="text-gray-300 font-medium">Bảo mật</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}