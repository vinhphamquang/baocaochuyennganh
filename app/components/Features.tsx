import {
  DocumentTextIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Nhận dạng đa định dạng',
    description: 'Hỗ trợ xử lý hình ảnh JPG, PNG và file PDF với chất lượng cao.',
    icon: DocumentTextIcon,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    hoverColor: 'hover:border-blue-300'
  },
  {
    name: 'Xử lý nhanh chóng',
    description: 'Trích xuất thông tin trong vòng 30 giây với độ chính xác cao.',
    icon: ClockIcon,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    hoverColor: 'hover:border-purple-300'
  },
  {
    name: 'Bảo mật tuyệt đối',
    description: 'Dữ liệu được mã hóa và xóa tự động sau khi xử lý xong.',
    icon: ShieldCheckIcon,
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50',
    hoverColor: 'hover:border-green-300'
  },
  {
    name: 'Đa loại chứng chỉ',
    description: 'Hỗ trợ IELTS, TOEFL, TOEIC, HSK, JLPT và nhiều chứng chỉ khác.',
    icon: GlobeAltIcon,
    gradient: 'from-indigo-500 to-blue-500',
    bgGradient: 'from-indigo-50 to-blue-50',
    hoverColor: 'hover:border-indigo-300'
  },
  {
    name: 'Thống kê chi tiết',
    description: 'Theo dõi lịch sử xử lý và phân tích xu hướng điểm số.',
    icon: ChartBarIcon,
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    hoverColor: 'hover:border-orange-300'
  },
  {
    name: 'Xuất dữ liệu linh hoạt',
    description: 'Xuất kết quả ra nhiều định dạng: JSON, CSV, Excel.',
    icon: CloudArrowDownIcon,
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-50 to-cyan-50',
    hoverColor: 'hover:border-teal-300'
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
            <span>✨</span>
            <span>Tính năng nổi bật</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Giải pháp <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">toàn diện</span> cho việc xử lý chứng chỉ
          </h2>
          <p className="mt-8 text-xl leading-8 text-gray-600 font-medium">
            Chúng tôi cung cấp các tính năng tiên tiến để đảm bảo quá trình trích xuất thông tin 
            chứng chỉ diễn ra một cách <span className="text-blue-600 font-bold">chính xác</span>, <span className="text-purple-600 font-bold">nhanh chóng</span> và <span className="text-green-600 font-bold">an toàn</span>.
          </p>
        </div>
        
        <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.name} className={`group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 ${feature.hoverColor} hover:scale-105 transform`}>
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Floating Animation */}
                <div className="relative" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-2xl group-hover:scale-110 transition-transform duration-300 mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 mb-4">
                      {feature.name}
                    </h3>
                    <p className="text-base leading-7 text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Hover Effect Arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}