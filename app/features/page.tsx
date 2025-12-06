'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Features from '../components/Features'
import Footer from '../components/Footer'

export default function FeaturesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl mb-6">
              Tính năng{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                nổi bật
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá các tính năng mạnh mẽ giúp bạn trích xuất thông tin chứng chỉ một cách nhanh chóng và chính xác
            </p>
          </div>
        </div>
        <Features />
      </main>
      <Footer />
    </div>
  )
}
