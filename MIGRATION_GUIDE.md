# 📦 Migration Guide - Cấu trúc mới

## 🔄 Thay đổi cấu trúc

### Trước đây (Cấu trúc cũ)
```
certificate-extraction-system/
├── app/                    # Frontend Next.js
├── lib/                    # Frontend utilities
├── server/                 # Backend Express
├── package.json            # Frontend dependencies
└── ...
```

### Bây giờ (Cấu trúc mới)
```
certificate-extraction-system/
├── frontend/               # Next.js Application
│   ├── app/               # App Router
│   ├── lib/               # Utilities
│   └── package.json       # Frontend dependencies
│
├── backend/                # Express.js API
│   ├── routes/            # API routes
│   ├── models/            # Database models
│   └── package.json       # Backend dependencies
│
└── package.json            # Root scripts
```

## ✅ Lợi ích của cấu trúc mới

1. **Tách biệt rõ ràng**: Frontend và Backend hoàn toàn độc lập
2. **Dễ deploy**: Có thể deploy riêng biệt hoặc cùng nhau
3. **Dễ maintain**: Mỗi phần có dependencies và cấu hình riêng
4. **Dễ scale**: Có thể scale frontend và backend độc lập
5. **Team collaboration**: Team frontend và backend có thể làm việc độc lập

## 🔧 Cập nhật cho Developer

### 1. Cập nhật Git repository
```bash
git pull origin main
```

### 2. Xóa node_modules cũ
```bash
# Xóa node_modules ở root (nếu có)
rm -rf node_modules

# Xóa .next build cũ
rm -rf .next
```

### 3. Cài đặt lại dependencies
```bash
# Cài đặt root dependencies (concurrently)
npm install

# Cài đặt frontend dependencies
cd frontend
npm install

# Cài đặt backend dependencies
cd ../backend
npm install
```

### 4. Cập nhật environment variables

#### Frontend (.env.local)
Di chuyển từ root `.env.local` sang `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend (.env)
Di chuyển từ `server/.env` sang `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate-extraction
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
# ... các biến khác
```

### 5. Cập nhật scripts

#### Trước đây:
```bash
npm run dev          # Chạy frontend
npm run server       # Chạy backend
```

#### Bây giờ:
```bash
npm run dev              # Chạy cả 2 cùng lúc
npm run dev:frontend     # Chỉ chạy frontend
npm run dev:backend      # Chỉ chạy backend
```

### 6. Cập nhật import paths (nếu cần)

Không cần thay đổi gì! Tất cả import paths vẫn giữ nguyên:
```typescript
// Frontend
import { api } from '@/lib/api'
import Header from '@/app/components/Header'

// Backend
const User = require('./models/User')
const authRouter = require('./routes/auth')
```

## 📝 Checklist Migration

- [ ] Pull code mới nhất
- [ ] Xóa node_modules và .next cũ
- [ ] Cài đặt dependencies mới
- [ ] Di chuyển .env files
- [ ] Test frontend: `cd frontend && npm run dev`
- [ ] Test backend: `cd backend && npm run dev`
- [ ] Test cả 2: `npm run dev` (từ root)
- [ ] Kiểm tra API connection
- [ ] Kiểm tra database connection
- [ ] Kiểm tra authentication
- [ ] Kiểm tra file upload
- [ ] Kiểm tra OCR functionality

## 🐛 Troubleshooting

### Lỗi: Cannot find module
```bash
# Xóa và cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Port already in use
```bash
# Kill processes
npx kill-port 3000
npx kill-port 5000
```

### Lỗi: Environment variables not found
```bash
# Kiểm tra file .env có đúng vị trí không
ls frontend/.env.local
ls backend/.env
```

### Lỗi: API connection failed
```bash
# Kiểm tra NEXT_PUBLIC_API_URL trong frontend/.env.local
# Đảm bảo backend đang chạy trên port 5000
```

## 📚 Tài liệu liên quan

- [README.md](./README.md) - Tổng quan dự án
- [QUICK_START.md](./QUICK_START.md) - Hướng dẫn nhanh
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Hướng dẫn phát triển
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Hướng dẫn deploy

## 🆘 Cần hỗ trợ?

Nếu gặp vấn đề khi migration:
1. Đọc kỹ hướng dẫn này
2. Kiểm tra [Troubleshooting](#troubleshooting)
3. Tạo issue trên GitHub
4. Liên hệ team lead

## ✨ Tính năng mới

Với cấu trúc mới, bạn có thể:

### Chạy cả 2 cùng lúc
```bash
npm run dev
```

### Chạy riêng biệt
```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && npm run dev
```

### Build production
```bash
npm run build
```

### Deploy riêng biệt
```bash
# Deploy frontend lên Vercel
cd frontend && vercel

# Deploy backend lên Railway
cd backend && railway up
```

## 🎉 Hoàn thành!

Sau khi hoàn tất migration, bạn sẽ có:
- ✅ Cấu trúc dự án rõ ràng hơn
- ✅ Dễ dàng phát triển và maintain
- ✅ Sẵn sàng cho production deployment
- ✅ Tách biệt frontend và backend hoàn toàn

Happy coding! 🚀
