'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { 
  CloudArrowUpIcon, 
  CpuChipIcon, 
  DocumentCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function HowItWorksPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  const steps = [
    {
      icon: CloudArrowUpIcon,
      title: 'Tải lên chứng chỉ',
      description: 'Upload file ảnh hoặc PDF của chứng chỉ ngoại ngữ',
      details: [
        'Hỗ trợ định dạng: JPG, PNG, PDF (tối đa 10MB)',
        'Độ phân giải tối thiểu: 300 DPI để đảm bảo chất lượng OCR',
        'Tự động xoay và cải thiện chất lượng ảnh',
        'Bảo mật: File được mã hóa ngay khi upload'
      ],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      time: '< 5 giây'
    },
    {
      icon: CpuChipIcon,
      title: 'AI xử lý tự động',
      description: 'Hệ thống AI phân tích và trích xuất thông tin quan trọng',
      details: [
        'OCR Engine: Tesseract.js 4.0+ với neural networks',
        'Machine Learning: Pattern recognition cho từng loại chứng chỉ',
        'NLP Processing: Hiểu ngữ cảnh và cấu trúc văn bản',
        'Validation: Tự động kiểm tra và sửa lỗi dữ liệu'
      ],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      time: '15-30 giây'
    },
    {
      icon: DocumentCheckIcon,
      title: 'Nhận kết quả',
      description: 'Xem, chỉnh sửa và tải xuống thông tin đã trích xuất',
      details: [
        'Preview: Xem trước kết quả với highlighting',
        'Edit: Chỉnh sửa thông tin nếu cần thiết',
        'Export: Xuất ra JSON, CSV, Excel, PDF',
        'History: Lưu trữ lịch sử xử lý trong 30 ngày'
      ],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      time: '< 2 giây'
    }
  ]

  const supportedFormats = [
    { name: 'IELTS', accuracy: '99.8%', fields: 'Listening, Reading, Writing, Speaking, Overall' },
    { name: 'TOEFL iBT', accuracy: '99.5%', fields: 'Reading, Listening, Speaking, Writing, Total' },
    { name: 'TOEIC L&R', accuracy: '99.7%', fields: 'Listening, Reading, Total Score' },
    { name: 'HSK', accuracy: '98.9%', fields: 'Level, Score, Listening, Reading, Writing' },
    { name: 'JLPT', accuracy: '99.2%', fields: 'Level, Language Knowledge, Reading, Listening' },
    { name: 'Cambridge', accuracy: '99.1%', fields: 'Level, Grade, Skills Breakdown' }
  ]

  const technicalSpecs = [
    {
      icon: ClockIcon,
      title: 'Hiệu suất xử lý',
      specs: [
        'Thời gian trung bình: 25 giây',
        'Throughput: 1000+ files/giờ',
        'Uptime: 99.9% SLA',
        'Concurrent users: Không giới hạn'
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bảo mật & Tuân thủ',
      specs: [
        'Mã hóa: AES-256 end-to-end',
        'Compliance: GDPR, CCPA, SOC 2',
        'Data retention: Tự động xóa sau 24h',
        'Audit logs: Đầy đủ theo dõi hoạt động'
      ]
    },
    {
      icon: ChartBarIcon,
      title: 'Độ chính xác',
      specs: [
        'OCR accuracy: 99.5% trung bình',
        'Field extraction: 98.7% chính xác',
        'Error rate: < 0.5%',
        'False positive: < 0.2%'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl">
                <span>🔧</span>
                <span>Quy trình hoạt động</span>
              </div>
              
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl mb-8">
                Cách{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  hoạt động
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
                Tìm hiểu chi tiết về quy trình <span className="text-cyan-400 font-bold">3 bước đơn giản</span> để trích xuất thông tin từ chứng chỉ ngoại ngữ với công nghệ AI tiên tiến
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                <a 
                  href="/extract" 
                  className="group relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                  Thử ngay miễn phí
                </a>
                <a 
                  href="#process" 
                  className="group inline-flex items-center text-lg font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Xem quy trình chi tiết
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Process Section */}
        <section id="process" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>⚡</span>
                <span>Quy trình 3 bước</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Từ <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">upload</span> đến <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">kết quả</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Quy trình được tối ưu hóa để đảm bảo tốc độ nhanh nhất và độ chính xác cao nhất
              </p>
            </div>

            <div className="space-y-20">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className={`bg-gradient-to-br ${step.bgColor} rounded-3xl p-8 shadow-xl border border-gray-200`}>
                      <div className="flex items-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-2xl`}>
                          <step.icon className="h-8 w-8 text-white" />
                        </div>
                        <div className="ml-6">
                          <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full font-bold text-lg mb-2">
                            {index + 1}
                          </div>
                          <div className="text-sm text-gray-600 font-semibold">Bước {index + 1}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        {step.description}
                      </p>
                      
                      <div className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Thời gian: {step.time}
                        </div>
                        {index < steps.length - 1 && (
                          <ArrowRightIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Certificates Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>📜</span>
                <span>Chứng chỉ được hỗ trợ</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Độ chính xác <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">cao</span> cho mọi loại chứng chỉ
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hệ thống được training riêng cho từng loại chứng chỉ để đạt độ chính xác tối đa
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supportedFormats.map((cert, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                    <div className="text-2xl font-black text-green-600">{cert.accuracy}</div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Trường dữ liệu:</strong>
                    </div>
                    <div className="text-gray-700">{cert.fields}</div>
                  </div>
                  <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: cert.accuracy }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>⚙️</span>
                <span>Thông số kỹ thuật</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Công nghệ <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">đẳng cấp</span> enterprise
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hạ tầng và công nghệ được thiết kế để đáp ứng nhu cầu từ cá nhân đến doanh nghiệp lớn
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {technicalSpecs.map((spec, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-xl border border-gray-200">
                  <div className="flex items-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                      <spec.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 ml-4">{spec.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {spec.specs.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Practices Section */}
        <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
                <span>💡</span>
                <span>Hướng dẫn tối ưu</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 sm:text-5xl mb-6">
                Tips để đạt <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">kết quả tốt nhất</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="flex items-center mb-6">
                  <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Nên làm</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Sử dụng ảnh có độ phân giải cao (tối thiểu 300 DPI)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Đảm bảo ánh sáng đều, không có bóng đổ</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Chụp thẳng góc, không bị nghiêng</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Sử dụng PDF gốc nếu có thể</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="flex items-center mb-6">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">Tránh</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Ảnh mờ, không rõ nét hoặc bị nhiễu</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Chụp trong điều kiện ánh sáng yếu</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">File bị cắt xén, thiếu thông tin quan trọng</span>
                  </li>
                  <li className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Định dạng file không được hỗ trợ</span>
                  </li>
                </ul>
              </div>
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
            <h2 className="text-5xl font-black text-white mb-8">
              Sẵn sàng <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">trải nghiệm?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Bắt đầu trích xuất thông tin chứng chỉ ngay hôm nay với quy trình đơn giản 3 bước
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="/extract" 
                className="group relative inline-flex items-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <CloudArrowUpIcon className="h-6 w-6 mr-3" />
                Bắt đầu ngay
              </a>
              <a 
                href="/features" 
                className="group inline-flex items-center text-lg font-bold text-white border-2 border-white/30 hover:border-cyan-400 px-10 py-5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                Xem tính năng
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
