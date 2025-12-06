'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import SupportedCertificates from '../components/SupportedCertificates'
import Testimonials from '../components/Testimonials'
import Footer from '../components/Footer'

export default function CertificatesPage() {
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
              Chứng chỉ{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                được hỗ trợ
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống hỗ trợ đa dạng các loại chứng chỉ ngoại ngữ phổ biến trên thế giới
            </p>
          </div>
        </div>
        <SupportedCertificates />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
