'use client'

import { useState, useEffect, useRef } from 'react'
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import AuthModal from './AuthModal'

interface HeaderProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function Header({ isLoggedIn, setIsLoggedIn }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Kiểm tra trạng thái đăng nhập ngay khi mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    
    // Đánh dấu đã khởi tạo xong
    setIsInitialized(true)
  }, [setIsLoggedIn])

  useEffect(() => {
    // Lắng nghe sự kiện mở modal đăng nhập từ các component khác
    const handleOpenAuthModal = () => {
      setAuthMode('login')
      setAuthModalOpen(true)
    }

    window.addEventListener('openAuthModal', handleOpenAuthModal)
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load user data khi isLoggedIn thay đổi
  useEffect(() => {
    if (isLoggedIn) {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    } else {
      setUser(null)
    }
  }, [isLoggedIn])

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    setUserMenuOpen(false)
    window.location.href = '/'
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-primary-100">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-primary-600">CertExtract</span>
            </a>
          </div>
          
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-3">
            <a href="/" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Trang chủ
            </a>
            <a href="/features" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Tính năng
            </a>
            <a href="/how-it-works" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Cách hoạt động
            </a>
            <a href="/extract" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 border-2 border-primary-600 rounded-lg hover:from-primary-700 hover:to-primary-800 hover:shadow-lg transition-all duration-200 shadow-md">
              Trích xuất
            </a>
            <a href="/certificates" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md">
              Chứng chỉ
            </a>
          </div>
          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 lg:items-center">
            {!isInitialized ? (
              // Loading skeleton
              <div className="flex gap-x-4 items-center">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ) : isLoggedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span>{user.fullName || user.name}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user.fullName || user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      👤 Hồ sơ cá nhân
                    </a>
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🚪 Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-transparent rounded-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-200 shadow-md transform hover:scale-105"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </nav>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="fixed inset-0 z-10"></div>
            <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="text-xl font-bold text-primary-600">CertExtract</span>
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  {/* Mobile Navigation Links */}
                  <div className="space-y-2 py-6">
                    <a 
                      href="/" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🏠 Trang chủ
                    </a>
                    <a 
                      href="/features" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ⚡ Tính năng
                    </a>
                    <a 
                      href="/how-it-works" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔧 Cách hoạt động
                    </a>
                    <a 
                      href="/extract" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      📤 Trích xuất
                    </a>
                    <a 
                      href="/certificates" 
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      📜 Chứng chỉ
                    </a>
                  </div>

                  <div className="py-6">
                    {!isInitialized ? (
                      <div className="space-y-3">
                        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                      </div>
                    ) : isLoggedIn && user ? (
                      <>
                        <div className="px-3 py-2 mb-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900">{user.fullName || user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        
                        <a 
                          href="/dashboard" 
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          👤 Hồ sơ cá nhân
                        </a>
                        
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            handleLogout()
                          }}
                          className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-600 hover:bg-red-50 mt-4"
                        >
                          🚪 Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAuthClick('login')}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          Đăng nhập
                        </button>
                        <button
                          onClick={() => handleAuthClick('register')}
                          className="btn-primary w-full mt-2"
                        >
                          Đăng ký
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSuccess={() => {
          setIsLoggedIn(true)
          setAuthModalOpen(false)
        }}
      />
    </>
  )
}