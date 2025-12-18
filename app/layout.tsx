import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './styles/print.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trích xuất thông tin chứng chỉ ngoại ngữ',
  description: 'Website tự động trích xuất thông tin từ chứng chỉ ngoại ngữ IELTS, TOEFL, TOEIC, HSK, JLPT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="page-transition">
          {children}
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}