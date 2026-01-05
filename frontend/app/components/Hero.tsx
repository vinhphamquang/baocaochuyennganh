import { DocumentTextIcon, ClockIcon, ShieldCheckIcon, SparklesIcon, CpuChipIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-float animation-delay-3000"></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-float animation-delay-5000"></div>
        <div className="absolute bottom-20 left-1/2 w-1 h-1 bg-indigo-400 rounded-full animate-float animation-delay-7000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

      <div className="mx-auto max-w-7xl px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-4xl py-20 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl backdrop-blur-sm border border-white/20 animate-pulse-glow">
              <SparklesIcon className="h-5 w-5 animate-spin-slow" />
              <span>Powered by Advanced AI & OCR Technology</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
              <span className="block">Trích xuất thông tin</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                chứng chỉ ngoại ngữ
              </span>
              <span className="relative block">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  tự động
                </span>
                <svg className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4" height="12" viewBox="0 0 300 12" fill="none">
                  <path d="M0 6C75 6 75 6 150 6C225 6 225 6 300 6" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" className="animate-draw"/>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="33%" stopColor="#3B82F6" />
                      <stop offset="66%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="mt-12 text-xl leading-8 text-gray-300 max-w-3xl mx-auto font-medium">
              Sử dụng công nghệ <span className="text-cyan-400 font-bold bg-cyan-400/10 px-2 py-1 rounded">AI OCR</span> tiên tiến để tự động đọc, phân tích và trích xuất thông tin từ 
              <span className="text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded ml-1">IELTS, TOEFL, TOEIC, HSK, JLPT</span> chỉ trong vài giây.
            </p>

            {/* CTA Buttons */}
            <div className="mt-16 flex items-center justify-center gap-x-6">
              <a 
                href="/extract" 
                className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CloudArrowUpIcon className="h-6 w-6 mr-3 relative z-10" />
                <span className="relative z-10">Bắt đầu ngay</span>
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a 
                href="/how-it-works" 
                className="group inline-flex items-center text-lg font-semibold text-gray-300 hover:text-white transition-colors duration-300 border border-gray-600 hover:border-cyan-400 px-8 py-5 rounded-2xl backdrop-blur-sm"
              >
                Tìm hiểu thêm 
                <svg className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

            {/* Tech Stack Badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <CpuChipIcon className="h-6 w-6 text-cyan-400" />
                <span className="text-sm font-bold text-white">Tesseract.js OCR</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                </svg>
                <span className="text-sm font-bold text-white">Next.js 14</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                <span className="text-sm font-bold text-white">MongoDB</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
                <ShieldCheckIcon className="h-6 w-6 text-purple-400" />
                <span className="text-sm font-bold text-white">Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 border border-white/20 hover:border-cyan-400/50 hover:bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
                <div className="mt-8">
                  <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">99.5%</div>
                  <div className="mt-3 text-lg font-bold text-white">Độ chính xác OCR</div>
                  <div className="mt-2 text-sm text-gray-300">Với công nghệ AI tiên tiến</div>
                </div>
              </div>
            </div>
            
            <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 border border-white/20 hover:border-purple-400/50 hover:bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <ClockIcon className="h-8 w-8 text-white" />
                </div>
                <div className="mt-8">
                  <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">&lt; 30s</div>
                  <div className="mt-3 text-lg font-bold text-white">Thời gian xử lý</div>
                  <div className="mt-2 text-sm text-gray-300">Nhanh chóng và hiệu quả</div>
                </div>
              </div>
            </div>
            
            <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 border border-white/20 hover:border-green-400/50 hover:bg-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <div className="mt-8">
                  <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">100%</div>
                  <div className="mt-3 text-lg font-bold text-white">Bảo mật dữ liệu</div>
                  <div className="mt-2 text-sm text-gray-300">Mã hóa end-to-end</div>
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
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        .animation-delay-7000 {
          animation-delay: 7s;
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5); }
          50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.8), 0 0 60px rgba(139, 92, 246, 0.3); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        @keyframes draw {
          0% { stroke-dasharray: 0 300; }
          100% { stroke-dasharray: 300 300; }
        }
        .animate-draw {
          stroke-dasharray: 300;
          animation: draw 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}