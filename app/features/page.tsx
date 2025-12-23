'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import {
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CloudArrowDownIcon,
  CpuChipIcon,
  EyeIcon,
  CogIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function FeaturesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  const mainFeatures = [
    {
      icon: DocumentTextIcon,
      title: 'Nhận dạng đa định dạng',
      description: 'Hỗ trợ xử lý hình ảnh JPG, PNG và file PDF với chất lượng cao.',
      details: [
        'Hỗ trợ file lên đến 10MB',
        'Tự động cải thiện chất lượng ảnh',
        'Xử lý ảnh độ phân giải cao 4K+',
        'Nhận dạng văn bản in và viết tay'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      hoverColor: 'hover:border-blue-300'
    },
    {
      icon: ClockIcon,
      title: 'Xử lý nhanh chóng',
      description: 'Trích xuất thông tin trong vòng 30 giây với độ chính xác cao.',
      details: [
        'Xử lý song song multi-threading',
        'Tối ưu hóa thuật toán AI',
        'Cache thông minh',
        'Real-time progress tracking'
      ],
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      hoverColor: 'hover:border-purple-300'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bảo mật tuyệt đối',
      description: 'Dữ liệu được mã hóa và xóa tự động sau khi xử lý xong.',
      details: [
        'Mã hóa AES-256 end-to-end',
        'Tuân thủ GDPR & CCPA',
        'Tự động xóa sau 24h',
        'Audit logs đầy đủ'
      ],
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      hoverColor: 'hover:border-green-300'
    },
    {
      icon: GlobeAltIcon,
      title: 'Đa loại chứng chỉ',
      description: 'Hỗ trợ IELTS, TOEFL, TOEIC, HSK, JLPT và nhiều chứng chỉ khác.',
      details: [
        '25+ loại chứng chỉ được hỗ trợ',
        'Template riêng cho từng loại',
        'Cập nhật định kỳ',
        'Độ chính xác 99%+'
      ],
      gradient: 'from-indigo-500 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50',
      hoverColor: 'hover:border-indigo-300'
    },
    {
      icon: ChartBarIcon,
      title: 'Thống kê chi tiết',
      description: 'Theo dõi lịch sử xử lý và phân tích xu hướng điểm số.',
      details: [
        'Dashboard analytics',
        'Export reports',
        'Trend analysis',
        'Performance metrics'
      ],
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      hoverColor: 'hover:border-orange-300'
    },
    {
      icon: CloudArrowDownIcon,
      title: 'Xuất dữ liệu linh hoạt',
      description: 'Xuất kết quả ra nhiều định dạng: JSON, CSV, Excel.',
      details: [
        'Multiple export formats',
        'Custom templates',
        'Batch processing',
        'API integration'
      ],
      gradient: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50',
      hoverColor: 'hover:border-teal-300'
    }
  ]

  const advancedFeatures = [
    {
      icon: CpuChipIcon,
      title: 'AI Engine tiên tiến',
      description: 'Sử dụng machine learning và neural networks để nhận dạng chính xác',
      stats: '99.5% accuracy'
    },
    {
      icon: EyeIcon,
      title: 'Computer Vision',
      description: 'Phân tích layout và cấu trúc document tự động',
      stats: '< 2s processing'
    },
    {
      icon: CogIcon,
      title: 'Auto-correction',
      description: 'Tự động sửa lỗi và validate dữ liệu được trích xuất',
      stats: '98% precision'
    },
    {
      icon: LightBulbIcon,
      title: 'Smart Recognition',
      description: 'Nhận dạng thông minh các trường dữ liệu quan trọng',
      stats: '25+ fields'
    }
  ]

  const benefits = [
    {
      title: 'Tiết kiệm thời gian',
      description: 'Giảm 95% thời gian xử lý so với nhập liệu thủ công',
      icon: '⚡',
      color: 'text-yellow-600'
    },
    {
      title: 'Độ chính xác cao',
      description: 'Đạt độ chính xác 99.5% với công nghệ AI tiên tiến',
      icon: '🎯',
      color: 'text-green-600'
    },
    {
      title: 'Bảo mật tối đa',
      description: 'Tuân thủ các tiêu chuẩn bảo mật quốc tế',
      icon: '🔒',
      color: 'text-blue-600'
    },
    {
      title: 'Dễ sử dụng',
      description: 'Giao diện thân thiện, không cần kỹ năng kỹ thuật',
      icon: '👥',
      color: 'text-purple-600'
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
                <SparklesIcon className="h-5 w-5 animate-spin-slow" />
                <span>Tính năng nổi bật</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl mb-8">
                <span className="block">Tính năng</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                  nổi bật
                </span>
              </h1>

              <p className="mt-8 text-xl leading-8 text-gray-300 max-w-3xl mx-auto font-medium">
                Khám phá các tính năng <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-1 rounded">mạnh mẽ</span> giúp bạn trích xuất thông tin chứng chỉ một 
                cách <span className="text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded ml-1">nhanh chóng</span> và <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded ml-1">chính xác</span>
              </p>

              <div className="mt-12 flex items-center justify-center gap-x-6">
                <a 
                  href="/extract" 
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <RocketLaunchIcon className="h-6 w-6 mr-3 relative z-10" />
                  <span className="relative z-10">Trải nghiệm ngay</span>
                </a>
                <a 
                  href="/how-it-works" 
                  className="group inline-flex items-center text-lg font-semibold text-gray-300 hover:text-white transition-colors duration-300 border border-gray-600 hover:border-cyan-400 px-8 py-5 rounded-2xl backdrop-blur-sm"
                >
                  Cách hoạt động
                  <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>🚀</span>
                <span>Tính năng chính</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl lg:text-6xl mb-6">
                Giải pháp <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">toàn diện</span> cho việc xử lý chứng chỉ
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
                Chúng tôi cung cấp các tính năng tiên tiến để đảm bảo quá trình trích xuất thông tin chứng chỉ diễn ra một cách chính xác, nhanh chóng và an toàn
              </p>
            </div>
            
            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3 mb-20">
              {mainFeatures.map((feature, index) => (
                <div key={feature.title} className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 ${feature.hoverColor} hover:scale-105 transform`}>
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="relative" style={{ animationDelay: `${index * 0.2}s` }}>
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-2xl group-hover:scale-110 transition-transform duration-300 mb-6`}>
                      <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-base leading-7 text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-6">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Hover Effect Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>🤖</span>
                <span>Công nghệ AI</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Công nghệ <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI tiên tiến</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sử dụng các thuật toán machine learning và neural networks mới nhất
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {advancedFeatures.map((feature, index) => (
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

        {/* Benefits Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>💎</span>
                <span>Lợi ích</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Tại sao chọn <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">CertExtract?</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
                    <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-4 ${benefit.color}`}>
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
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
          
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative">
            <h2 className="text-5xl font-black text-white mb-8 lg:text-6xl">
              Khám phá <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">tính năng</span> mạnh mẽ
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Trải nghiệm tất cả tính năng AI OCR tiên tiến với gói miễn phí. Không cần thẻ tín dụng!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="/extract" 
                className="group relative inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <RocketLaunchIcon className="h-6 w-6 mr-3 relative z-10" />
                <span className="relative z-10">Bắt đầu miễn phí</span>
              </a>
              
              <a 
                href="/how-it-works" 
                className="group inline-flex items-center text-lg font-bold text-white border-2 border-white/30 hover:border-cyan-400 px-10 py-5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                Xem demo
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
