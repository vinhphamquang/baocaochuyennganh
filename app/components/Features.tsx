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
  },
  {
    name: 'Xử lý nhanh chóng',
    description: 'Trích xuất thông tin trong vòng 30 giây với độ chính xác cao.',
    icon: ClockIcon,
  },
  {
    name: 'Bảo mật tuyệt đối',
    description: 'Dữ liệu được mã hóa và xóa tự động sau khi xử lý xong.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Đa loại chứng chỉ',
    description: 'Hỗ trợ IELTS, TOEFL, TOEIC, HSK, JLPT và nhiều chứng chỉ khác.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Thống kê chi tiết',
    description: 'Theo dõi lịch sử xử lý và phân tích xu hướng điểm số.',
    icon: ChartBarIcon,
  },
  {
    name: 'Xuất dữ liệu linh hoạt',
    description: 'Xuất kết quả ra nhiều định dạng: JSON, CSV, Excel.',
    icon: CloudArrowDownIcon,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Tính năng nổi bật</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Giải pháp toàn diện cho việc xử lý chứng chỉ
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Chúng tôi cung cấp các tính năng tiên tiến để đảm bảo quá trình trích xuất thông tin 
            chứng chỉ diễn ra một cách chính xác, nhanh chóng và an toàn.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Supported Certificates */}
        <div className="mt-24">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Chứng chỉ được hỗ trợ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {['IELTS', 'TOEFL', 'TOEIC', 'HSK', 'JLPT'].map((cert) => (
                <div key={cert} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-lg font-semibold text-primary-600">{cert}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}