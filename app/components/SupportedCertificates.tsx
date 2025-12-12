export default function SupportedCertificates() {
  const certificates = [
    {
      name: 'IELTS',
      description: 'International English Language Testing System',
      icon: '🇬🇧',
      color: 'from-red-500 to-red-600',
      ocrSupport: 'Tốt',
      ocrLevel: 'high'
    },
    {
      name: 'TOEFL',
      description: 'Test of English as a Foreign Language',
      icon: '🇺🇸',
      color: 'from-blue-500 to-blue-600',
      ocrSupport: 'Tốt',
      ocrLevel: 'high'
    },
    {
      name: 'TOEIC',
      description: 'Test of English for International Communication',
      icon: '💼',
      color: 'from-green-500 to-green-600',
      ocrSupport: 'Tốt',
      ocrLevel: 'high'
    },
    {
      name: 'VSTEP',
      description: 'Vietnamese Standardized Test of English Proficiency',
      icon: '🇻🇳',
      color: 'from-indigo-500 to-indigo-600',
      ocrSupport: 'Tốt',
      ocrLevel: 'high'
    },
    {
      name: 'HSK',
      description: 'Hanyu Shuiping Kaoshi (Chinese Proficiency Test)',
      icon: '🇨🇳',
      color: 'from-yellow-500 to-yellow-600',
      ocrSupport: 'Trung bình',
      ocrLevel: 'medium'
    },
    {
      name: 'JLPT',
      description: 'Japanese Language Proficiency Test',
      icon: '🇯🇵',
      color: 'from-pink-500 to-pink-600',
      ocrSupport: 'Trung bình',
      ocrLevel: 'medium'
    },
    {
      name: 'TOPIK',
      description: 'Test of Proficiency in Korean',
      icon: '🇰🇷',
      color: 'from-purple-500 to-purple-600',
      ocrSupport: 'Trung bình',
      ocrLevel: 'medium'
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
            Hệ thống sử dụng Tesseract.js OCR để trích xuất thông tin từ các chứng chỉ ngoại ngữ phổ biến
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-700">
                  <strong>Tốt (90-95%):</strong> Chứng chỉ tiếng Anh với font Latin
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                <span className="text-gray-700">
                  <strong>Trung bình (70-85%):</strong> Chứng chỉ có ký tự đặc biệt (Trung, Nhật, Hàn)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{cert.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {cert.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      cert.ocrLevel === 'high' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      OCR: {cert.ocrSupport}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {cert.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      cert.ocrLevel === 'high' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></span>
                    {cert.ocrLevel === 'high' 
                      ? 'Tesseract.js nhận diện tốt (90-95%)' 
                      : 'Tesseract.js nhận diện trung bình (70-85%)'
                    }
                  </div>
                </div>
              </div>
              <div className={`mt-4 h-1 bg-gradient-to-r ${cert.color} rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* OCR Information */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">🔍 Công nghệ OCR - Tesseract.js</h3>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Hệ thống sử dụng Tesseract.js - thư viện OCR mã nguồn mở hàng đầu, 
              chạy hoàn toàn trên trình duyệt để bảo vệ quyền riêng tư của bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold mb-2">Độ chính xác cao</h4>
              <p className="text-sm text-gray-300">
                90-95% với chứng chỉ tiếng Anh<br/>
                70-85% với chứng chỉ đa ngôn ngữ
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-bold mb-2">Bảo mật tuyệt đối</h4>
              <p className="text-sm text-gray-300">
                Xử lý hoàn toàn trên trình duyệt<br/>
                Không gửi ảnh lên server
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold mb-2">Xử lý nhanh</h4>
              <p className="text-sm text-gray-300">
                3-10 giây cho ảnh chất lượng tốt<br/>
                Hỗ trợ tiếng Anh + tiếng Việt
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-blue-600 rounded-lg p-4 inline-block">
              <p className="text-sm font-semibold">💡 Mẹo để OCR chính xác hơn:</p>
              <p className="text-xs mt-1 text-blue-100">
                Ảnh rõ nét • Ánh sáng đều • Chụp thẳng góc • Font chữ rõ ràng
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Không tìm thấy chứng chỉ bạn cần?
          </p>
          <button className="text-primary-600 font-semibold hover:text-primary-700">
            Liên hệ với chúng tôi →
          </button>
        </div>
      </div>
    </section>
  )
}
