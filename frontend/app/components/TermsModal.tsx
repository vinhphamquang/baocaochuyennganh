'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                    <Dialog.Title className="text-xl font-bold text-white">
                      Điều khoản sử dụng
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
                  <div className="prose prose-sm max-w-none">
                    {/* Cập nhật lần cuối */}
                    <p className="text-sm text-gray-500 mb-6">
                      Cập nhật lần cuối: 27 tháng 12, 2025
                    </p>

                    {/* 1. Chấp nhận điều khoản */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        1. Chấp nhận điều khoản
                      </h3>
                      <p className="text-gray-700 mb-2">
                        Bằng việc truy cập và sử dụng dịch vụ trích xuất thông tin chứng chỉ ngoại ngữ, 
                        bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sau đây.
                      </p>
                      <p className="text-gray-700">
                        Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không 
                        sử dụng Dịch vụ của chúng tôi.
                      </p>
                    </section>

                    {/* 2. Mô tả dịch vụ */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        2. Mô tả dịch vụ
                      </h3>
                      <p className="text-gray-700 mb-2">
                        Dịch vụ của chúng tôi cung cấp công nghệ OCR và AI để tự động trích xuất thông tin 
                        từ các chứng chỉ ngoại ngữ bao gồm:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        <li>IELTS (International English Language Testing System)</li>
                        <li>TOEFL (Test of English as a Foreign Language)</li>
                        <li>TOEIC (Test of English for International Communication)</li>
                        <li>HSK (Hanyu Shuiping Kaoshi)</li>
                        <li>JLPT (Japanese Language Proficiency Test)</li>
                      </ul>
                    </section>

                    {/* 3. Tài khoản người dùng */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        3. Tài khoản người dùng
                      </h3>
                      <p className="text-gray-700 font-semibold mb-2">3.1. Đăng ký tài khoản</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mb-3">
                        <li>Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký</li>
                        <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình</li>
                        <li>Bạn phải thông báo ngay nếu phát hiện truy cập trái phép</li>
                        <li>Mỗi người chỉ được tạo một tài khoản</li>
                      </ul>
                      <p className="text-gray-700 font-semibold mb-2">3.2. Quyền và trách nhiệm</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        <li>Bạn có quyền truy cập và quản lý dữ liệu của mình</li>
                        <li>Bạn có quyền xóa tài khoản bất cứ lúc nào</li>
                        <li>Bạn không được chia sẻ tài khoản cho người khác</li>
                        <li>Bạn không được sử dụng Dịch vụ cho mục đích bất hợp pháp</li>
                      </ul>
                    </section>

                    {/* 4. Quyền riêng tư */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        4. Quyền riêng tư và bảo mật
                      </h3>
                      <p className="text-gray-700 font-semibold mb-2">4.1. Thu thập dữ liệu</p>
                      <p className="text-gray-700 mb-2">Chúng tôi thu thập:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mb-3">
                        <li>Thông tin tài khoản: email, họ tên, mật khẩu (đã mã hóa)</li>
                        <li>Hình ảnh chứng chỉ bạn tải lên</li>
                        <li>Dữ liệu trích xuất từ chứng chỉ</li>
                        <li>Lịch sử sử dụng dịch vụ</li>
                      </ul>
                      <p className="text-gray-700 font-semibold mb-2">4.2. Bảo mật</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        <li>Mật khẩu được mã hóa bằng bcrypt</li>
                        <li>Kết nối được bảo vệ bằng HTTPS</li>
                        <li>Dữ liệu được lưu trữ an toàn trên MongoDB Atlas</li>
                        <li>Hình ảnh có thể được tự động xóa sau khi xử lý</li>
                      </ul>
                    </section>

                    {/* 5. Sử dụng dịch vụ */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        5. Sử dụng dịch vụ
                      </h3>
                      <p className="text-gray-700 font-semibold mb-2">5.1. Được phép</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mb-3">
                        <li>Tải lên chứng chỉ hợp pháp của bạn</li>
                        <li>Trích xuất và sử dụng dữ liệu cho mục đích cá nhân</li>
                        <li>Xuất dữ liệu ra các định dạng khác nhau</li>
                        <li>Lưu trữ lịch sử trích xuất</li>
                      </ul>
                      <p className="text-gray-700 font-semibold mb-2">5.2. Không được phép</p>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                        <li>Tải lên chứng chỉ giả mạo hoặc không hợp pháp</li>
                        <li>Sử dụng Dịch vụ để lừa đảo hoặc gian lận</li>
                        <li>Tấn công, hack hoặc phá hoại hệ thống</li>
                        <li>Sử dụng bot hoặc công cụ tự động không được phép</li>
                        <li>Sao chép, phân phối hoặc bán lại Dịch vụ</li>
                      </ul>
                    </section>

                    {/* 6. Giới hạn trách nhiệm */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        6. Giới hạn trách nhiệm
                      </h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Độ chính xác:</strong> Mặc dù chúng tôi nỗ lực đạt độ chính xác cao nhất (99.5%), 
                        OCR và AI có thể mắc lỗi. Bạn nên kiểm tra và xác nhận lại thông tin trích xuất.
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Tính khả dụng:</strong> Chúng tôi không đảm bảo Dịch vụ luôn khả dụng 100%. 
                        Có thể có thời gian bảo trì hoặc gián đoạn không mong muốn.
                      </p>
                      <p className="text-gray-700">
                        <strong>Trách nhiệm pháp lý:</strong> Chúng tôi không chịu trách nhiệm cho thiệt hại 
                        trực tiếp hoặc gián tiếp từ việc sử dụng Dịch vụ.
                      </p>
                    </section>

                    {/* 7. Liên hệ */}
                    <section className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        7. Liên hệ
                      </h3>
                      <p className="text-gray-700 mb-2">
                        Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ:
                      </p>
                      <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                        <p className="text-gray-700">
                          <strong>Email:</strong>{' '}
                          <a href="mailto:support@certificateextraction.com" className="text-blue-600 hover:text-blue-700">
                            support@certificateextraction.com
                          </a>
                        </p>
                        <p className="text-gray-700">
                          <strong>Website:</strong>{' '}
                          <a href="/" className="text-blue-600 hover:text-blue-700">
                            certificateextraction.com
                          </a>
                        </p>
                      </div>
                    </section>

                    {/* Acceptance */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-gray-700 text-center">
                        Bằng việc sử dụng Dịch vụ, bạn xác nhận rằng đã đọc, hiểu và đồng ý với các 
                        điều khoản sử dụng này.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
                  >
                    Tôi đã hiểu
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
