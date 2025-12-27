# Cấu trúc dự án Certificate Extraction System

## 📁 Tổng quan cấu trúc

```
certificate-extraction-system/
├── frontend/                 # Next.js Frontend Application
│   ├── app/                 # Next.js App Router
│   ├── lib/                 # Frontend utilities & helpers
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.js
│
└── backend/                 # Express.js Backend API
    ├── routes/              # API routes
    ├── models/              # MongoDB models
    ├── middleware/          # Express middleware
    ├── services/            # Business logic
    ├── utils/               # Backend utilities
    ├── package.json
    └── server.js
```

## 🚀 Hướng dẫn chạy dự án

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Chạy trên http://localhost:3000
```

### Backend (Express.js)
```bash
cd backend
npm install
npm run dev
# Chạy trên http://localhost:5000
```

## 🔧 Cấu hình môi trường

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 📝 Ghi chú
- Frontend và Backend hoàn toàn độc lập
- Giao tiếp qua REST API
- Dễ dàng deploy riêng biệt
