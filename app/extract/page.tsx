'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import UploadSection from '../components/UploadSection'
import Footer from '../components/Footer'
import {
  CloudArrowUpIcon,
  SparklesIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function ExtractPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  const supportedFormats = [
    {
      format: 'JPG/JPEG',
      maxSize: '10MB',
      quality: 'Tốt nhất',
      description: 'Định dạng ảnh phổ biến, dễ xử lý'
    },
    {
      format: 'PNG',
      maxSize: '10MB', 
      quality: 'Tốt nhất',
      description: 'Chất lượng cao, không nén mất dữ liệu'
    },
    {
      format: 'PDF',
      maxSize: '10MB',
      quality: 'Xuất sắc',
      description: 'Định dạng tốt nhất cho OCR'
    }
  ]

  const processingSteps = [
    {
      step: 1,
      title: 'Upload File',
      description: 'Tải lên chứng chỉ của bạn',
      time: '< 5s',
      icon: CloudArrowUpIcon
    },
    {
      step: 2,
      title: 'AI Processing',
      description: 'Phân tích và trích xuất thông tin',
      time: '15-30s',
      icon: SparklesIcon
    },
    {
      step: 3,
      title: 'Get Results',
      description: 'Nhận kết quả và xuất dữ liệu',
      time: '< 2s',
      icon: DocumentTextIcon
    }
  ]

  const tips = [
    {
      type: 'success',
      icon: CheckCircleIcon,
      title: 'Để đạt kết quả tốt nhất:',
      items: [
        'Sử dụng ảnh có độ phân giải cao (tối thiểu 300 DPI)',
        'Chụp trong điều kiện ánh sáng đều, tránh bóng đổ',
        'Đảm bảo chứng chỉ nằm thẳng, không bị nghiêng',
        'Ưu tiên sử dụng file PDF gốc nếu có thể'
      ]
    },
    {
      type: 'warning',
      icon: ExclamationTriangleIcon,
      title: 'Tránh những lỗi thường gặp:',
      items: [
        'Ảnh mờ, không rõ nét hoặc bị nhiễu',
        'Chụp trong điều kiện ánh sáng yếu',
        'File bị cắt xén, thiếu thông tin quan trọng',
        'Sử dụng định dạng file không được hỗ trợ'
      ]
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
                <CloudArrowUpIcon className="h-5 w-5 animate-spin-slow" />
                <span>Trích xuất thông tin</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>

              <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl mb-8">
                <span className="block">Trích xuất</span>
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                  thông tin
                </span>
              </h1>

              <p className="mt-8 text-xl leading-8 text-gray-300 max-w-3xl mx-auto font-medium">
                Tải lên chứng chỉ của bạn và để <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-1 rounded">AI tự động</span> trích xuất thông tin 
                chỉ trong <span className="text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded ml-1">vài giây</span>
              </p>

              <div className="mt-12 flex items-center justify-center gap-x-6">
                <a 
                  href="#upload" 
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CloudArrowUpIcon className="h-6 w-6 mr-3 relative z-10" />
                  <span className="relative z-10">Bắt đầu upload</span>
                </a>
                <a 
                  href="#guide" 
                  className="group inline-flex items-center text-lg font-semibold text-gray-300 hover:text-white transition-colors duration-300 border border-gray-600 hover:border-cyan-400 px-8 py-5 rounded-2xl backdrop-blur-sm"
                >
                  Hướng dẫn sử dụng
                  <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
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
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload" className="py-24 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>📤</span>
                <span>Upload chứng chỉ</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Tải lên <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">chứng chỉ</span> của bạn
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hỗ trợ định dạng JPG, PNG, PDF. Kích thước tối đa 10MB
              </p>
            </div>
            
            <UploadSection />
          </div>
        </section>

        {/* Processing Steps */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>⚡</span>
                <span>Quy trình xử lý</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">3 bước</span> đơn giản
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Quy trình tự động hóa hoàn toàn với công nghệ AI tiên tiến
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {processingSteps.map((step, index) => (
                <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:scale-105">
                  <div className="flex items-center mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-6">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full font-bold text-lg mb-2">
                        {step.step}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">Bước {step.step}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {step.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Thời gian: {step.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>📁</span>
                <span>Định dạng hỗ trợ</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Định dạng <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">được hỗ trợ</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Chúng tôi hỗ trợ các định dạng file phổ biến với chất lượng OCR tối ưu
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportedFormats.map((format, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:scale-105">
                  <div className="text-center">
                    <div className="text-4xl mb-4">
                      {format.format === 'JPG/JPEG' && '🖼️'}
                      {format.format === 'PNG' && '🎨'}
                      {format.format === 'PDF' && '📄'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{format.format}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kích thước tối đa:</span>
                        <span className="font-semibold text-blue-600">{format.maxSize}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Chất lượng OCR:</span>
                        <span className="font-semibold text-green-600">{format.quality}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{format.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section id="guide" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>💡</span>
                <span>Hướng dẫn sử dụng</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Tips để đạt <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">kết quả tốt nhất</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {tips.map((tip, index) => (
                <div key={index} className={`bg-white rounded-2xl p-8 shadow-xl border-2 ${tip.type === 'success' ? 'border-green-200' : 'border-orange-200'}`}>
                  <div className="flex items-center mb-6">
                    <tip.icon className={`h-8 w-8 mr-3 ${tip.type === 'success' ? 'text-green-500' : 'text-orange-500'}`} />
                    <h3 className="text-xl font-bold text-gray-900">{tip.title}</h3>
                  </div>
                  <ul className="space-y-4">
                    {tip.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <tip.icon className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${tip.type === 'success' ? 'text-green-500' : 'text-orange-500'}`} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
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
              Trải nghiệm <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">ngay hôm nay</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
              Upload chứng chỉ của bạn và nhận kết quả trong vòng 30 giây. Hoàn toàn miễn phí và bảo mật!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="#upload" 
                className="group relative inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <CloudArrowUpIcon className="h-6 w-6 mr-3 relative z-10" />
                <span className="relative z-10">Upload ngay</span>
              </a>
              
              <a 
                href="/certificates" 
                className="group inline-flex items-center text-lg font-bold text-white border-2 border-white/30 hover:border-cyan-400 px-10 py-5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                Xem chứng chỉ hỗ trợ
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
