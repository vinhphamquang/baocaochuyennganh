import { DocumentTextIcon, ClockIcon, ShieldCheckIcon, SparklesIcon, CpuChipIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <div className="mx-auto max-w-7xl px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-20 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <SparklesIcon className="h-4 w-4" />
              <span>Powered by AI & OCR Technology</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl">
              Trích xuất thông tin{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                chứng chỉ ngoại ngữ
              </span>{' '}
              <span className="relative">
                tự động
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M0 4C50 4 50 4 100 4C150 4 150 4 200 4" stroke="url(#gradient)" strokeWidth="6" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#9333EA" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-xl leading-8 text-gray-600 max-w-3xl mx-auto font-medium">
              Sử dụng công nghệ <span className="text-blue-600 font-bold">AI OCR</span> tiên tiến để tự động đọc, phân tích và trích xuất thông tin từ 
              <span className="text-purple-600 font-bold"> IELTS, TOEFL, TOEIC, HSK, JLPT</span> chỉ trong vài giây.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <a 
                href="#upload" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <CloudArrowUpIcon className="h-6 w-6 mr-2" />
                Bắt đầu ngay
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
              </a>
              <a 
                href="#features" 
                className="group inline-flex items-center text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Tìm hiểu thêm 
                <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

            {/* Tech Stack Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                <CpuChipIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Tesseract.js OCR</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700">Next.js 14</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700">MongoDB</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-700">Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <DocumentTextIcon className="h-7 w-7 text-white" />
                </div>
                <div className="mt-6">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">99.5%</div>
                  <div className="mt-2 text-sm font-semibold text-gray-600">Độ chính xác OCR</div>
                  <div className="mt-1 text-xs text-gray-500">Với công nghệ AI tiên tiến</div>
                </div>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <ClockIcon className="h-7 w-7 text-white" />
                </div>
                <div className="mt-6">
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">&lt; 30s</div>
                  <div className="mt-2 text-sm font-semibold text-gray-600">Thời gian xử lý</div>
                  <div className="mt-1 text-xs text-gray-500">Nhanh chóng và hiệu quả</div>
                </div>
              </div>
            </div>
            
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <ShieldCheckIcon className="h-7 w-7 text-white" />
                </div>
                <div className="mt-6">
                  <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">100%</div>
                  <div className="mt-2 text-sm font-semibold text-gray-600">Bảo mật dữ liệu</div>
                  <div className="mt-1 text-xs text-gray-500">Mã hóa end-to-end</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}