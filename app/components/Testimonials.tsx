import { StarIcon } from '@heroicons/react/24/solid'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Sinh viên',
      content: 'Hệ thống giúp tôi tiết kiệm rất nhiều thời gian khi cần trích xuất thông tin từ chứng chỉ IELTS. Rất nhanh và chính xác!',
      rating: 5,
      avatar: '👨‍🎓'
    },
    {
      name: 'Trần Thị B',
      role: 'Nhân viên HR',
      content: 'Công cụ tuyệt vời cho công việc tuyển dụng. Tôi có thể xử lý hàng trăm chứng chỉ trong vài phút thay vì vài giờ.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Lê Văn C',
      role: 'Giáo viên',
      content: 'Độ chính xác cao và giao diện dễ sử dụng. Đây là giải pháp tôi đang tìm kiếm cho việc quản lý chứng chỉ của học sinh.',
      rating: 5,
      avatar: '👨‍🏫'
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Người dùng nói gì về chúng tôi
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hàng nghìn người dùng đã tin tưởng và sử dụng hệ thống của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center">
                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
