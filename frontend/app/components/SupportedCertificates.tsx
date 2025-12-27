export default function SupportedCertificates() {
  const certificates = [
    {
      name: 'IELTS',
      description: 'International English Language Testing System',
      icon: '🇬🇧',
      color: 'from-red-500 to-red-600',
      ocrSupport: 'Xuất sắc',
      ocrLevel: 'excellent',
      accuracy: '95-98%',
      features: ['Band Score 0-9', 'Listening, Reading, Writing, Speaking', 'British Council/IDP']
    },
    {
      name: 'TOEFL iBT',
      description: 'Test of English as a Foreign Language',
      icon: '🇺🇸',
      color: 'from-blue-500 to-blue-600',
      ocrSupport: 'Xuất sắc',
      ocrLevel: 'excellent',
      accuracy: '93-96%',
      features: ['Score 0-120', '4 Skills (0-30 each)', 'ETS Official']
    },
    {
      name: 'TOEIC L&R',
      description: 'Test of English for International Communication',
      icon: '💼',
      color: 'from-green-500 to-green-600',
      ocrSupport: 'Xuất sắc',
      ocrLevel: 'excellent',
      accuracy: '94-97%',
      features: ['Score 10-990', 'Listening & Reading', 'Business English']
    },
    {
      name: 'VSTEP',
      description: 'Vietnamese Standardized Test of English Proficiency',
      icon: '🇻🇳',
      color: 'from-indigo-500 to-indigo-600',
      ocrSupport: 'Xuất sắc',
      ocrLevel: 'excellent',
      accuracy: '92-95%',
      features: ['Score 0-10', '4 Skills + Overall', 'Bộ GD&ĐT Việt Nam']
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Chứng chỉ được hỗ trợ
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Hệ thống AI-OCR hybrid với độ chính xác cao cho các chứng chỉ tiếng Anh phổ biến
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-700">
                  <strong>AI-Enhanced OCR:</strong> Gemini AI + Tesseract với độ chính xác 92-98%
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-700">
                  <strong>Smart Validation:</strong> Tự động kiểm tra và sửa lỗi
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certificates.map((cert, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="flex items-start space-x-6">
                <div className="text-5xl">{cert.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {cert.name}
                    </h3>
                    <span className="px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-800">
                      {cert.accuracy}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    {cert.description}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {cert.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Độ chính xác OCR:</span>
                    <span className="font-bold text-green-600">{cert.ocrSupport}</span>
                  </div>
                </div>
              </div>
              <div className={`mt-6 h-2 bg-gradient-to-r ${cert.color} rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Technology Information */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">🤖 Công nghệ AI-OCR Hybrid</h3>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Kết hợp Google Gemini AI và Tesseract OCR với xử lý ảnh nâng cao, 
              validation thông minh và auto-correction để đạt độ chính xác tối đa
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold mb-2">Độ chính xác cao</h4>
              <p className="text-sm text-gray-300">
                92-98% với AI enhancement<br/>
                Smart validation & correction
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-bold mb-2">Bảo mật tuyệt đối</h4>
              <p className="text-sm text-gray-300">
                Xử lý client-side<br/>
                Không lưu trữ ảnh
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold mb-2">Xử lý nhanh</h4>
              <p className="text-sm text-gray-300">
                15-30 giây với AI<br/>
                Real-time progress
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h4 className="font-bold mb-2">Auto-correction</h4>
              <p className="text-sm text-gray-300">
                Tự động sửa lỗi OCR<br/>
                Validation thông minh
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-blue-600 rounded-lg p-4 inline-block">
              <p className="text-sm font-semibold">💡 Mẹo để đạt độ chính xác tối đa:</p>
              <p className="text-xs mt-1 text-blue-100">
                Ảnh HD (1200x900+) • Ánh sáng đều • Chụp thẳng góc • Toàn bộ chứng chỉ trong khung
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Cần hỗ trợ chứng chỉ khác?
          </p>
          <a href="/contact" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Liên hệ với chúng tôi →
          </a>
        </div>
      </div>
    </section>
  )
}
