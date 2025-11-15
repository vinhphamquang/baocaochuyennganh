# 📚 HƯỚNG DẪN ĐẦY ĐỦ - HỆ THỐNG TRÍCH XUẤT CHỨNG CHỈ

## 🎯 Tổng quan

Hệ thống trích xuất thông tin tự động từ chứng chỉ ngoại ngữ (IELTS, TOEIC, TOEFL, VSTEP) sử dụng công nghệ OCR (Tesseract.js).

---

## 🚀 Khởi động nhanh

### **1. Cài đặt dependencies**
```bash
npm install
cd server && npm install
```

### **2. Khởi động hệ thống**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### **3. Truy cập**
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## ✨ Tính năng chính

### **1. Tải lên chứng chỉ**
- Hỗ trợ: JPG, PNG, PDF
- Kích thước tối đa: 10MB
- Drag & drop hoặc click chọn file

### **2. OCR tự động (Tesseract.js)**
- Nhận dạng tiếng Anh + tiếng Việt
- Trích xuất thông tin:
  - Họ tên
  - Ngày sinh
  - Số chứng chỉ
  - Ngày thi/cấp
  - Điểm số chi tiết
  - Loại chứng chỉ

### **3. Hiển thị kết quả**
- Giao diện đẹp, chuyên nghiệp
- Màu sắc phân biệt từng kỹ năng
- Hover effects mượt mà

### **4. Xuất dữ liệu**
- JSON
- CSV (tương thích Excel)
- Excel (.xlsx)

---

## 📁 Cấu trúc dự án

```
├── app/                    # Next.js frontend
│   ├── components/         # React components
│   │   ├── UploadSection.tsx    # Upload & OCR
│   │   ├── CertificateUpload.tsx
│   │   └── ...
│   ├── dashboard/          # Dashboard page
│   ├── admin/              # Admin page
│   └── page.tsx            # Home page
├── lib/
│   └── ocr.ts              # Tesseract.js OCR service
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── models/             # MongoDB models
│   └── server.js           # Entry point
└── README.md
```

---

## 🔧 Công nghệ sử dụng

### **Frontend:**
- Next.js 14
- TypeScript
- Tailwind CSS
- Tesseract.js (OCR)

### **Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file upload)

---

## 📖 Hướng dẫn sử dụng

### **Bước 1: Đăng ký/Đăng nhập**
1. Truy cập http://localhost:3000
2. Click "Đăng nhập" hoặc "Đăng ký"
3. Nhập thông tin

### **Bước 2: Upload chứng chỉ**
1. Scroll xuống phần "Tải lên chứng chỉ của bạn"
2. Kéo thả hoặc click chọn file ảnh
3. Click "Trích xuất thông tin (OCR)"

### **Bước 3: Xem kết quả**
- Thông tin được hiển thị tự động
- Điểm số có màu sắc riêng
- Điểm tổng nổi bật màu vàng

### **Bước 4: Xuất dữ liệu**
1. Vào Dashboard
2. Click "Xuất dữ liệu"
3. Chọn format (JSON/CSV/Excel)

---

## 🎨 Giao diện

### **Màu sắc:**
- **Tổng:** Vàng gold (nổi bật)
- **Listening:** Xanh dương
- **Reading:** Xanh lá
- **Writing:** Tím
- **Speaking:** Đỏ

### **Effects:**
- Gradient backgrounds
- Shadow hover
- Smooth transitions
- Responsive design

---

## 🔍 OCR - Tesseract.js

### **Ưu điểm:**
- ✅ Miễn phí 100%
- ✅ Chạy trên browser (privacy tốt)
- ✅ Hỗ trợ tiếng Việt
- ✅ Không cần API key

### **Độ chính xác:**
- Ảnh rõ nét: 90-95%
- Ảnh trung bình: 70-85%
- Ảnh mờ: 50-70%

### **Tips để OCR chính xác:**
- Ảnh rõ nét, độ phân giải cao
- Chụp thẳng góc
- Ánh sáng đều
- Font chữ rõ ràng

---

## 🐛 Troubleshooting

### **Backend không chạy:**
```bash
cd server
npm install
npm run dev
```

### **Frontend không chạy:**
```bash
npm install
npm run dev
```

### **MongoDB không connect:**
- Kiểm tra MongoDB đang chạy
- Hoặc dùng MongoDB Atlas (cloud)

### **OCR không hoạt động:**
```bash
npm install tesseract.js --force
npm run dev
```

---

## 📊 API Endpoints

### **Auth:**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### **Certificates:**
- `POST /api/certificates/upload` - Upload & OCR
- `GET /api/certificates` - Lấy danh sách
- `GET /api/certificates/:id` - Lấy chi tiết
- `PUT /api/certificates/:id` - Cập nhật
- `DELETE /api/certificates/:id` - Xóa

### **Export:**
- `GET /api/export/json` - Xuất JSON
- `GET /api/export/csv` - Xuất CSV
- `GET /api/export/excel` - Xuất Excel

### **Admin:**
- `GET /api/admin/users` - Quản lý users
- `GET /api/admin/certificates` - Quản lý certificates
- `GET /api/admin/stats` - Thống kê

---

## 🎯 Tính năng nâng cao

### **Đã có:**
- ✅ OCR tự động
- ✅ Multi-user support
- ✅ Dashboard cá nhân
- ✅ Admin panel
- ✅ Export data
- ✅ Lịch sử trích xuất

### **Có thể thêm:**
- [ ] Batch upload (nhiều file)
- [ ] Email notifications
- [ ] API cho mobile app
- [ ] Machine learning model riêng
- [ ] Tích hợp Google Vision API

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check Console logs (F12)
2. Xem file logs trong server
3. Restart dev server
4. Clear cache và reload

---

## 🎉 Hoàn thành!

Hệ thống đã sẵn sàng sử dụng!

**Truy cập:** http://localhost:3000

**Chúc bạn thành công! 🚀**
