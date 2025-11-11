import { DocumentTextIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function Hero() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Trích xuất thông tin{' '}
            <span className="text-primary-600">chứng chỉ ngoại ngữ</span>{' '}
            tự động
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Tự động hóa quy trình đọc, phân tích và trích xuất thông tin quan trọng từ các chứng chỉ 
            IELTS, TOEFL, TOEIC, HSK, JLPT một cách nhanh chóng và chính xác.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#upload" className="btn-primary text-lg px-8 py-3">
              Bắt đầu ngay
            </a>
            <a href="#features" className="text-lg font-semibold leading-6 text-gray-900 hover:text-primary-600">
              Tìm hiểu thêm <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-gray-900">99.5%</div>
              <div className="text-sm text-gray-600">Độ chính xác</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <ClockIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-gray-900">&lt; 30s</div>
              <div className="text-sm text-gray-600">Thời gian xử lý</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="mt-4 text-center">
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Bảo mật</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}