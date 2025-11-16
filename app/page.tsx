'use client'

import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import UploadSection from './components/UploadSection'
import Features from './components/Features'
import SupportedCertificates from './components/SupportedCertificates'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main>
        <Hero />
        <HowItWorks />
        <UploadSection />
        <Features />
        <SupportedCertificates />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}