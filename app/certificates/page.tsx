'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  CheckCircleIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function CertificatesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  const certificates = [
    {
      name: 'IELTS',
      fullName: 'International English Language Testing System',
      icon: '🇬🇧',
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50',
      accuracy: '95-98%',
      processingTime: '15-25s',
      fields: ['Listening', 'Reading', 'Writing', 'Speaking', 'Overall Band'],
      popularity: 95,
      description: 'Chứng chỉ tiếng Anh phổ biến nhất thế giới cho du học và định cư',
      features: ['Nhận dạng band score chính xác', 'Trích xuất điểm từng kỹ năng', 'Hỗ trợ cả Academic & General', 'AI validation thông minh']
    },
    {
      name: 'TOEFL iBT',
      fullName: 'Test of English as a Foreign Language',
      icon: '🇺🇸',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      accuracy: '93-96%',
      processingTime: '20-30s',
      fields: ['Reading', 'Listening', 'Speaking', 'Writing', 'Total Score'],
      popularity: 90,
      description: 'Chứng chỉ tiếng Anh chuẩn Mỹ cho du học tại các trường đại học',
      features: ['Nhận dạng điểm tổng và từng phần', 'Hỗ trợ TOEFL iBT & PBT', 'Trích xuất thông tin test date', 'ETS format recognition']
    },
    {
      name: 'TOEIC L&R',
      fullName: 'Test of English for International Communication',
      icon: '💼',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      accuracy: '94-97%',
      processingTime: '10-20s',
      fields: ['Listening', 'Reading', 'Total Score', 'Percentile'],
      popularity: 85,
      description: 'Chứng chỉ tiếng Anh doanh nghiệp được công nhận rộng rãi',
      features: ['Nhận dạng điểm Listening & Reading', 'Trích xuất percentile rank', 'Business English focus', 'ETS official format']
    },
    {
      name: 'VSTEP',
      fullName: 'Vietnamese Standardized Test of English Proficiency',
      icon: '🇻🇳',
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      accuracy: '92-95%',
      processingTime: '15-25s',
      fields: ['Listening', 'Reading', 'Writing', 'Speaking', 'Overall'],
      popularity: 80,
      description: 'Chứng chỉ tiếng Anh chuẩn Việt Nam cho giáo dục và công chức',
      features: ['Nhận dạng chuẩn Việt Nam', 'Trích xuất điểm theo thang 10', 'Hỗ trợ tất cả cấp độ', 'Bộ GD&ĐT format']
    }
  ]

  const ocrFeatures = [
    {
      icon: CpuChipIcon,
      title: 'Gemini AI Engine',
      description: 'Google Gemini 1.5 Pro với khả năng nhận dạng thông minh',
      stats: '95-98% accuracy'
    },
    {
      icon: EyeIcon,
      title: 'Advanced OCR',
      description: 'Tesseract.js với image preprocessing và AI enhancement',
      stats: '< 30s processing'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Smart Validation',
      description: 'AI validation với auto-correction và error detection',
      stats: '100% reliable'
    },
    {
      icon: GlobeAltIcon,
      title: 'Hybrid Processing',
      description: 'Tự động chọn phương pháp tối ưu cho từng loại chứng chỉ',
      stats: '4 certificates'
    }
  ]

  const tips = [
    {
      icon: '📸',
      title: 'Chất lượng ảnh',
      description: 'Sử dụng ảnh có độ phân giải cao (tối thiểu 300 DPI)'
    },
    {
      icon: '💡',
      title: 'Ánh sáng',
      description: 'Chụp trong điều kiện ánh sáng đều, tránh bóng đổ'
    },
    {
      icon: '📐',
      title: 'Góc chụp',
      description: 'Chụp thẳng góc, không bị nghiêng hoặc méo'
    },
    {
      icon: '🎯',
      title: 'Định dạng',
      description: 'Ưu tiên sử dụng file PDF gốc nếu có thể'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-float"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-float animation-delay-1000"></div>
            <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-float animation-delay-3000"></div>
            <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-float animation-delay-5000"></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl backdrop-blur-sm border border-white/20 animate-pulse-glow">
                <AcademicCapIcon className="h-5 w-5 animate-spin-slow" />
                <span>Chứng chỉ được hỗ trợ</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl mb-8">
                <span className="block">Chứng chỉ</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                  được hỗ trợ
                </span>
              </h1>

              <p className="mt-8 text-xl leading-8 text-gray-300 max-w-3xl mx-auto font-medium">
                Hệ thống hỗ trợ <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-1 rounded">4 loại chứng chỉ</span> tiếng Anh phổ biến nhất với 
                độ chính xác <span className="text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded ml-1">92-98%</span>
              </p>

              <div className="mt-12 flex items-center justify-center gap-x-6">
                <a 
                  href="/extract" 
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <SparklesIcon className="h-6 w-6 mr-3 relative z-10" />
                  <span className="relative z-10">Trích xuất ngay</span>
                </a>
                <a 
                  href="#certificates" 
                  className="group inline-flex items-center text-lg font-semibold text-gray-300 hover:text-white transition-colors duration-300 border border-gray-600 hover:border-cyan-400 px-8 py-5 rounded-2xl backdrop-blur-sm"
                >
                  Xem danh sách
                  <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </a>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">4</div>
                  <div className="text-gray-300 font-medium">Chứng chỉ chính</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">92-98%</div>
                  <div className="text-gray-300 font-medium">Độ chính xác</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">AI+OCR</div>
                  <div className="text-gray-300 font-medium">Công nghệ hybrid</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certificates Grid Section */}
        <section id="certificates" className="py-24 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>📜</span>
                <span>Danh sách chứng chỉ</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">4 chứng chỉ</span> được hỗ trợ tốt
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                Chúng tôi tập trung vào 4 chứng chỉ tiếng Anh phổ biến nhất với độ chính xác cao nhất
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {certificates.map((cert, index) => (
                <div key={index} className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:scale-105 transform overflow-hidden`}>
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cert.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {cert.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {cert.accuracy}
                        </div>
                        <div className="text-xs text-gray-500">Độ chính xác</div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {cert.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {cert.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Thời gian xử lý:</span>
                        <span className="font-semibold text-blue-600">{cert.processingTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Độ phổ biến:</span>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`bg-gradient-to-r ${cert.gradient} h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${cert.popularity}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">{cert.popularity}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Trường dữ liệu:</div>
                      <div className="flex flex-wrap gap-1">
                        {cert.fields.slice(0, 3).map((field, fieldIndex) => (
                          <span key={fieldIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {field}
                          </span>
                        ))}
                        {cert.fields.length > 3 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            +{cert.fields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {cert.features.slice(0, 2).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start text-xs text-gray-600">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    {/* Hover Effect Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OCR Technology Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>🤖</span>
                <span>Công nghệ OCR</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Công nghệ <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI-OCR Hybrid</span> tiên tiến
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kết hợp Google Gemini AI và Tesseract OCR với xử lý ảnh nâng cao để đạt độ chính xác tối đa
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {ocrFeatures.map((feature, index) => (
                <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-300 hover:scale-105">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                  <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {feature.stats}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>💡</span>
                <span>Tips & Tricks</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Mẹo để đạt <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">kết quả tốt nhất</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Làm theo những hướng dẫn này để tối ưu hóa độ chính xác OCR
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tips.map((tip, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {tip.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative">
            <h2 className="text-5xl font-black text-white mb-8 lg:text-6xl">
              Trích xuất <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">chứng chỉ</span> ngay
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Upload chứng chỉ của bạn và nhận kết quả trong vòng 30 giây. Hoàn toàn miễn phí và bảo mật!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="/extract" 
                className="group relative inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <SparklesIcon className="h-6 w-6 mr-3 relative z-10" />
                <span className="relative z-10">Bắt đầu ngay</span>
              </a>
              
              <a 
                href="/how-it-works" 
                className="group inline-flex items-center text-lg font-bold text-white border-2 border-white/30 hover:border-cyan-400 px-10 py-5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                Cách hoạt động
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
