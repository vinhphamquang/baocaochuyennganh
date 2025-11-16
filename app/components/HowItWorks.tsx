import { 
  CloudArrowUpIcon, 
  CpuChipIcon, 
  DocumentCheckIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

export default function HowItWorks() {
  const steps = [
    {
      icon: CloudArrowUpIcon,
      title: 'Tải lên chứng chỉ',
      description: 'Upload file ảnh hoặc PDF của chứng chỉ ngoại ngữ của bạn',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: CpuChipIcon,
      title: 'AI xử lý tự động',
      description: 'Hệ thống AI phân tích và trích xuất thông tin quan trọng',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: DocumentCheckIcon,
      title: 'Nhận kết quả',
      description: 'Xem và tải xuống thông tin đã được trích xuất',
      color: 'from-green-500 to-green-600'
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Cách thức hoạt động
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chỉ với 3 bước đơn giản, bạn có thể trích xuất thông tin từ chứng chỉ ngoại ngữ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowDownIcon className="h-8 w-8 text-primary-400 rotate-[-90deg]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
