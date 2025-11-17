'use client'

import { useState, useEffect } from 'react'
import { StarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { commentAPI, Comment as APIComment } from '@/lib/api'
import toast from 'react-hot-toast'

interface Comment {
  _id: string
  userName: string
  content: string
  rating: number
  createdAt: string
}

export default function Testimonials() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }

    // Tải danh sách bình luận
    loadComments()
  }, [])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const response = await commentAPI.getAll()
      if (response.success) {
        setComments(response.data)
      }
    } catch (error: any) {
      console.error('Error loading comments:', error)
      toast.error('Không thể tải bình luận')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      setShowAuthModal(true)
      return
    }

    if (!newComment.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Vui lòng đăng nhập lại')
        return
      }

      const response = await commentAPI.create(
        {
          content: newComment.trim(),
          rating: rating
        },
        token
      )

      if (response.success) {
        toast.success('Bình luận đã được gửi thành công!')
        setNewComment('')
        setRating(5)
        // Tải lại danh sách bình luận
        await loadComments()
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error)
      toast.error(error.message || 'Không thể gửi bình luận')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

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

        {/* Form bình luận */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <ChatBubbleLeftIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">
                Để lại bình luận của bạn
              </h3>
            </div>

            {isLoggedIn ? (
              <form onSubmit={handleSubmitComment}>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Đánh giá của bạn
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-8 w-8 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nội dung bình luận
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Chia sẻ trải nghiệm của bạn về hệ thống..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Bạn cần đăng nhập để có thể bình luận
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách bình luận */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-gray-500 mt-4">Đang tải bình luận...</p>
          </div>
        ) : comments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {comments.map((comment) => (
              <div 
                key={comment._id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {[...Array(comment.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{comment.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="text-4xl mr-4">👤</div>
                  <div>
                    <div className="font-bold text-gray-900">{comment.userName}</div>
                    <div className="text-sm text-gray-600">Thành viên</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
            </p>
          </div>
        )}

        {/* Modal đăng nhập */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Yêu cầu đăng nhập
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn cần đăng nhập để có thể bình luận và chia sẻ trải nghiệm của mình.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    // Trigger mở modal đăng nhập chính
                    window.dispatchEvent(new CustomEvent('openAuthModal'))
                  }}
                  className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
