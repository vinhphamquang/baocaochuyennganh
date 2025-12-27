# Frontend - Certificate Extraction System

## 🎨 Công nghệ sử dụng
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **OCR**: Tesseract.js
- **State Management**: React Hooks
- **HTTP Client**: Axios

## 📦 Cài đặt

```bash
npm install
```

## 🚀 Chạy development

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 🏗️ Build production

```bash
npm run build
npm start
```

## 📁 Cấu trúc thư mục

```
frontend/
├── app/                      # Next.js App Router
│   ├── admin/               # Trang quản trị
│   ├── certificates/        # Quản lý chứng chỉ
│   ├── components/          # React components
│   ├── contact/             # Trang liên hệ
│   ├── dashboard/           # Dashboard người dùng
│   ├── extract/             # Trang trích xuất
│   ├── features/            # Trang tính năng
│   ├── how-it-works/        # Hướng dẫn sử dụng
│   ├── low-res-ocr/         # OCR cho ảnh chất lượng thấp
│   ├── reset-password/      # Đặt lại mật khẩu
│   ├── forgot-password/     # Quên mật khẩu
│   ├── styles/              # CSS styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
│
└── lib/                      # Utilities & Helpers
    ├── api.ts               # API client
    ├── ocr.ts               # OCR cơ bản
    ├── ocr-advanced.ts      # OCR nâng cao
    ├── ocr-enhanced.ts      # OCR cải tiến
    ├── ocr-ai-hybrid.ts     # OCR kết hợp AI
    ├── ocr-ai-validator.ts  # Xác thực OCR bằng AI
    ├── ocr-low-resolution-enhancer.ts  # Cải thiện ảnh chất lượng thấp
    └── useAuth.ts           # Authentication hook
```

## 🔧 Cấu hình

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm start` - Chạy production server
- `npm run lint` - Kiểm tra code với ESLint
