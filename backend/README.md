# Backend - Certificate Extraction System

## 🛠️ Công nghệ sử dụng
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs
- **AI**: Google Gemini API
- **OCR**: Tesseract.js
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer

## 📦 Cài đặt

```bash
npm install
```

## 🚀 Chạy development

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

## 🏗️ Chạy production

```bash
npm start
```

## 📁 Cấu trúc thư mục

```
backend/
├── routes/                   # API Routes
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   ├── certificates.js      # Certificate management
│   ├── templates.js         # Template management
│   ├── templates-simple.js  # Simplified templates
│   ├── reports.js           # Reporting routes
│   ├── reports-simple.js    # Simplified reports
│   ├── comments.js          # Comments system
│   └── ai-ocr.js            # AI-powered OCR
│
├── models/                   # MongoDB Models
│   ├── User.js              # User model
│   ├── Certificate.js       # Certificate model
│   ├── Template.js          # Template model
│   ├── Comment.js           # Comment model
│   ├── SystemLog.js         # System logging
│   └── PasswordResetRequest.js  # Password reset
│
├── middleware/               # Express Middleware
│   └── auth.js              # JWT authentication
│
├── services/                 # Business Logic
│   └── ocr-service.js       # OCR processing
│
├── utils/                    # Utilities
│   └── email.js             # Email service
│
├── .env                      # Environment variables
├── server.js                 # Main server file
├── eng.traineddata          # Tesseract English data
└── vie.traineddata          # Tesseract Vietnamese data
```

## 🔧 Cấu hình

Tạo file `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate-extraction
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@certificateextraction.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📝 Scripts

- `npm run dev` - Chạy development server với nodemon
- `npm start` - Chạy production server
- `npm run seed-templates` - Seed template data vào database

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Certificates
- `GET /api/certificates` - Lấy danh sách chứng chỉ
- `POST /api/certificates` - Tạo chứng chỉ mới
- `PUT /api/certificates/:id` - Cập nhật chứng chỉ
- `DELETE /api/certificates/:id` - Xóa chứng chỉ

### Admin
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/stats` - Thống kê hệ thống
- `POST /api/admin/password-reset-requests` - Yêu cầu reset mật khẩu

### AI OCR
- `POST /api/ai-ocr/extract` - Trích xuất thông tin bằng AI

## 🗄️ Database Models

### User
- email, password, name, role, isActive

### Certificate
- userId, imageUrl, extractedData, status, createdAt

### Template
- name, fields, description, isActive

### Comment
- certificateId, userId, content, createdAt
