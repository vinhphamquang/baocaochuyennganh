'use client'

import { useState } from 'react'
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authAPI } from '@/lib/api'
import Cookies from 'js-cookie'
import TermsModal from './TermsModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onSuccess: () => void
}

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export default function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const loginForm = useForm<LoginForm>()
  const registerForm = useForm<RegisterForm>()

  if (!isOpen) return null

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login(data)
      
      // Save token to both cookie and localStorage
      Cookies.set('token', response.token, { expires: 7 })
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      toast.success('Đăng nhập thành công!')
      
      // Gọi onSuccess để cập nhật trạng thái đăng nhập
      onSuccess()
      
      // Reload trang để cập nhật UI
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      toast.error(error.message || 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    
    setIsLoading(true)
    try {
      const response = await authAPI.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      })
      
      // Save token to both cookie and localStorage
      Cookies.set('token', response.token, { expires: 7 })
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 })
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      toast.success('Đăng ký thành công!')
      
      // Gọi onSuccess để cập nhật trạng thái đăng nhập
      onSuccess()
      
      // Reload trang để cập nhật UI
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error: any) {
      toast.error(error.message || 'Đăng ký thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900 mb-6">
                {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              </h3>
              
              {mode === 'login' ? (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...loginForm.register('email', { required: 'Email là bắt buộc' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...loginForm.register('password', { required: 'Mật khẩu là bắt buộc' })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <a href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                        Quên mật khẩu?
                      </a>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                  </button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      {...registerForm.register('fullName', { required: 'Họ tên là bắt buộc' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                      placeholder="Nguyễn Văn A"
                      autoComplete="name"
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...registerForm.register('email', { required: 'Email là bắt buộc' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...registerForm.register('password', { 
                          required: 'Mật khẩu là bắt buộc',
                          minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...registerForm.register('confirmPassword', { required: 'Xác nhận mật khẩu là bắt buộc' })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="agree-terms"
                      name="agree-terms"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                      Tôi đồng ý với{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setShowTermsModal(true)
                        }}
                        className="text-primary-600 hover:text-primary-500 underline"
                      >
                        Điều khoản sử dụng
                      </button>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  )
}