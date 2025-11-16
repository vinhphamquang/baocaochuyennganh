export default function SupportedCertificates() {
  const certificates = [
    {
      name: 'IELTS',
      description: 'International English Language Testing System',
      icon: '🇬🇧',
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'TOEFL',
      description: 'Test of English as a Foreign Language',
      icon: '🇺🇸',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'TOEIC',
      description: 'Test of English for International Communication',
      icon: '💼',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'HSK',
      description: 'Hanyu Shuiping Kaoshi (Chinese Proficiency Test)',
      icon: '🇨🇳',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      name: 'JLPT',
      description: 'Japanese Language Proficiency Test',
      icon: '🇯🇵',
      color: 'from-pink-500 to-pink-600'
    },
    {
      name: 'TOPIK',
      description: 'Test of Proficiency in Korean',
      icon: '🇰🇷',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Chứng chỉ được hỗ trợ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hệ thống hỗ trợ trích xuất thông tin từ các chứng chỉ ngoại ngữ phổ biến
          </p>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {cert.description}
                  </p>
                </div>
              </div>
              <div className={`mt-4 h-1 bg-gradient-to-r ${cert.color} rounded-full`}></div>
            </div>
          ))}
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
