'use client'

import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import AuthModal from './AuthModal'

interface HeaderProps {
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

export default function Header({ isLoggedIn, setIsLoggedIn }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    // Lắng nghe sự kiện mở modal đăng nhập từ các component khác
    const handleOpenAuthModal = () => {
      setAuthMode('login')
      setAuthModalOpen(true)
    }

    window.addEventListener('openAuthModal', handleOpenAuthModal)
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal)
    }
  }, [])

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
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
          

          
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            {isLoggedIn ? (
              <>
                <a href="/dashboard" className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600">
                  Dashboard
                </a>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleAuthClick('login')}
                  className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => handleAuthClick('register')}
                  className="btn-primary text-sm"
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

                  <div className="py-6">
                    {isLoggedIn ? (
                      <>
                        <a href="/dashboard" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                          Dashboard
                        </a>
                        <button
                          onClick={() => setIsLoggedIn(false)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          Đăng xuất
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