# ⚡ Quick Start Guide

## 🚀 Chạy dự án trong 5 phút

### Bước 1: Clone repository
```bash
git clone https://github.com/your-repo/certificate-extraction-system.git
cd certificate-extraction-system
```

### Bước 2: Cài đặt dependencies
```bash
# Cài đặt concurrently để chạy cả 2 cùng lúc
npm install

# Cài đặt dependencies cho frontend và backend
npm run install:all
```

### Bước 3: Cấu hình môi trường

#### Frontend
```bash
cd frontend
cp .env.example .env.local
```

Chỉnh sửa `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Backend
```bash
cd backend
cp .env.example .env
```

Chỉnh sửa `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate-extraction
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
```

### Bước 4: Khởi động MongoDB
```bash
# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongodb

# Windows
# Mở MongoDB Compass hoặc start service
```

### Bước 5: Chạy ứng dụng

#### Option 1: Chạy cả 2 cùng lúc (Khuyến nghị)
```bash
# Từ thư mục root
npm run dev
```

#### Option 2: Chạy riêng biệt

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Bước 6: Truy cập ứng dụng

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:5000
- 📊 Admin Dashboard: http://localhost:3000/admin

### Bước 7: Đăng nhập Admin

```
📧 Email: admin@certificateextraction.com
🔒 Password: admin123456
```

## 🎯 Các lệnh hữu ích

### Development
```bash
npm run dev              # Chạy cả frontend và backend
npm run dev:frontend     # Chỉ chạy frontend
npm run dev:backend      # Chỉ chạy backend
```

### Build
```bash
npm run build            # Build cả 2
npm run build:frontend   # Build frontend
```

### Testing
```bash
npm test                 # Test cả 2
npm run test:frontend    # Test frontend
npm run test:backend     # Test backend
```

### Linting
```bash
npm run lint             # Lint cả 2
npm run lint:frontend    # Lint frontend
npm run lint:backend     # Lint backend
```

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Kill port 3000
npx kill-port 3000

# Kill port 5000
npx kill-port 5000
```

### MongoDB không kết nối được
```bash
# Kiểm tra MongoDB status
mongosh

# Nếu không chạy, start lại
sudo systemctl start mongodb
```

### Dependencies lỗi
```bash
# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📚 Tài liệu chi tiết

- 📘 [Frontend Documentation](./frontend/README.md)
- 📗 [Backend Documentation](./backend/README.md)
- 📙 [Development Guide](./DEVELOPMENT.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)

## 🆘 Cần giúp đỡ?

- 📖 Đọc [Documentation](./README.md)
- 🐛 Báo lỗi tại [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Hỏi đáp tại [Discord](https://discord.gg/your-server)
- 📧 Email: support@certificateextraction.com

## ✅ Checklist

- [ ] Node.js 18+ đã cài đặt
- [ ] MongoDB đã cài đặt và chạy
- [ ] Dependencies đã cài đặt
- [ ] Environment variables đã cấu hình
- [ ] Frontend chạy tại port 3000
- [ ] Backend chạy tại port 5000
- [ ] Có thể đăng nhập admin
- [ ] Upload và OCR hoạt động

Chúc bạn code vui vẻ! 🎉
