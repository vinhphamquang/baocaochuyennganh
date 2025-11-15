# 👨‍💼 HƯỚNG DẪN QUẢN TRỊ VIÊN (ADMIN)

## 🎯 Tổng quan

Giao diện quản trị cung cấp đầy đủ công cụ để quản lý hệ thống, người dùng, và giám sát hoạt động.

---

## 🔐 Truy cập Admin Panel

### **Bước 1: Tạo tài khoản Admin**

Mặc định, tài khoản đầu tiên đăng ký sẽ là admin. Hoặc cập nhật role trong MongoDB:

```javascript
// Trong MongoDB
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### **Bước 2: Đăng nhập**
1. Truy cập: http://localhost:3000
2. Đăng nhập với tài khoản admin
3. Truy cập: http://localhost:3000/admin

---

## ✨ Tính năng Admin

### **1. 📊 Tổng quan (Overview)**

**Thống kê real-time:**
- 👥 Tổng số người dùng
- ✅ Người dùng đang hoạt động
- 📄 Tổng số chứng chỉ đã xử lý
- ✅ Chứng chỉ xử lý thành công
- ❌ Chứng chỉ xử lý thất bại
- 📈 Tỷ lệ thành công
- 📅 Số chứng chỉ xử lý hôm nay

**Biểu đồ:**
- Phân bố theo loại chứng chỉ (IELTS, TOEIC, TOEFL, VSTEP)
- Xu hướng xử lý theo thời gian
- Hiệu suất hệ thống

---

### **2. 👥 Quản lý người dùng**

**Chức năng:**
- ✅ Xem danh sách tất cả người dùng
- 🔍 Tìm kiếm người dùng
- 📊 Xem số chứng chỉ đã xử lý
- 🔒 Khóa tài khoản
- ✅ Mở khóa tài khoản
- 🗑️ Xóa tài khoản

**Thông tin hiển thị:**
- Tên người dùng
- Email
- Ngày tham gia
- Số chứng chỉ đã xử lý
- Trạng thái (Active/Inactive)

**Hành động:**

```typescript
// Khóa tài khoản
PUT /api/admin/users/:id/status
Body: { isActive: false }

// Mở khóa
PUT /api/admin/users/:id/status
Body: { isActive: true }

// Xóa tài khoản
DELETE /api/admin/users/:id
```

---

### **3. 📄 Quản lý chứng chỉ**

**Chức năng:**
- ✅ Xem tất cả chứng chỉ trong hệ thống
- 🔍 Tìm kiếm theo tên, số chứng chỉ
- 📊 Lọc theo loại, trạng thái
- ✏️ Chỉnh sửa thông tin
- 🗑️ Xóa chứng chỉ
- 📥 Xuất dữ liệu

**Thông tin hiển thị:**
- Tên người dùng
- Loại chứng chỉ
- Số chứng chỉ
- Ngày xử lý
- Trạng thái (Processing/Completed/Failed)
- Độ tin cậy OCR

**Hành động:**

```typescript
// Lấy tất cả chứng chỉ
GET /api/admin/certificates

// Cập nhật chứng chỉ
PUT /api/admin/certificates/:id
Body: { extractedData: {...} }

// Xóa chứng chỉ
DELETE /api/admin/certificates/:id
```

---

### **4. 📋 Quản lý mẫu chứng chỉ**

**Chức năng:**
- ✅ Thêm mẫu chứng chỉ mới
- ✏️ Cập nhật regex patterns
- 🔍 Test patterns với ảnh mẫu
- 📊 Xem độ chính xác của từng mẫu

**Cấu trúc mẫu:**

```javascript
{
  type: "IELTS",
  patterns: {
    fullName: /Family\s+Name\s+([A-Z]+)/i,
    dateOfBirth: /Date\s+of\s+Birth[:\s|]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
    certificateNumber: /Form\s+Number\s+([A-Z0-9]+)/i,
    scores: {
      listening: /Listening[:\s|]+["\s°\.\-]*(\d+)/i,
      reading: /Reading[:\s|]+["\s°\.\-]*(\d+)/i,
      writing: /Writing[:\s|]+["\s°\.\-]*(\d+)/i,
      speaking: /Speaking[:\s|]+["\s°\.\-]*(\d+)/i,
      overall: /Band\s+(\d+)/i
    }
  },
  scoreScale: "0-100", // hoặc "0-9"
  issuingOrganization: "British Council / IDP"
}
```

**Thêm mẫu mới:**

```typescript
POST /api/admin/templates
Body: {
  type: "TOEFL",
  patterns: {...},
  scoreScale: "0-120"
}
```

---

### **5. 🔍 Giám sát hệ thống**

**System Logs:**
- ⚠️ Cảnh báo (Warnings)
- ❌ Lỗi (Errors)
- ℹ️ Thông tin (Info)
- 🔧 Debug logs

**Thông tin giám sát:**
- Thời gian xử lý trung bình
- Tỷ lệ thành công/thất bại
- Lỗi phổ biến
- Hiệu suất OCR
- Tài nguyên server (CPU, RAM)

**API:**

```typescript
// Lấy logs
GET /api/admin/logs?type=error&limit=100

// Lấy system health
GET /api/admin/health
```

---

### **6. 📊 Báo cáo thống kê**

**Báo cáo có sẵn:**

1. **Báo cáo người dùng:**
   - Số người dùng mới theo thời gian
   - Top users (xử lý nhiều nhất)
   - Tỷ lệ người dùng hoạt động

2. **Báo cáo chứng chỉ:**
   - Số chứng chỉ xử lý theo ngày/tuần/tháng
   - Phân bố theo loại chứng chỉ
   - Tỷ lệ thành công theo loại

3. **Báo cáo hiệu suất:**
   - Thời gian xử lý trung bình
   - Độ chính xác OCR
   - Tỷ lệ lỗi

**Xuất báo cáo:**

```typescript
// Xuất báo cáo Excel
GET /api/admin/reports/export?type=users&format=excel

// Xuất báo cáo PDF
GET /api/admin/reports/export?type=certificates&format=pdf
```

---

## 🎨 Giao diện Admin

### **Layout:**
```
┌─────────────────────────────────────┐
│  Header (Logo + User Menu)         │
├─────────────────────────────────────┤
│ Sidebar │ Main Content              │
│         │                           │
│ 📊 Overview                         │
│ 👥 Users                            │
│ 📄 Certificates                     │
│ 📋 Templates                        │
│ 🔍 Logs                             │
│ 📊 Reports                          │
│         │                           │
└─────────────────────────────────────┘
```

### **Màu sắc:**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Info: Gray (#6B7280)

---

## 🔧 API Endpoints

### **Users:**
```
GET    /api/admin/users              # Lấy danh sách
GET    /api/admin/users/:id          # Chi tiết
PUT    /api/admin/users/:id/status   # Khóa/Mở khóa
DELETE /api/admin/users/:id          # Xóa
```

### **Certificates:**
```
GET    /api/admin/certificates       # Lấy tất cả
GET    /api/admin/certificates/:id   # Chi tiết
PUT    /api/admin/certificates/:id   # Cập nhật
DELETE /api/admin/certificates/:id   # Xóa
```

### **Templates:**
```
GET    /api/admin/templates          # Lấy mẫu
POST   /api/admin/templates          # Thêm mẫu
PUT    /api/admin/templates/:id      # Cập nhật
DELETE /api/admin/templates/:id      # Xóa
```

### **Statistics:**
```
GET    /api/admin/statistics         # Thống kê tổng quan
GET    /api/admin/statistics/users   # Thống kê users
GET    /api/admin/statistics/certs   # Thống kê certificates
```

### **Logs:**
```
GET    /api/admin/logs               # System logs
GET    /api/admin/health             # System health
```

---

## 🛡️ Bảo mật

### **Middleware adminAuth:**

```javascript
// server/middleware/auth.js
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)
    
    if (!user || user.role !== 'admin') {
      throw new Error()
    }
    
    req.userId = user._id
    next()
  } catch (error) {
    res.status(403).json({ message: 'Không có quyền truy cập' })
  }
}
```

### **Phân quyền:**
- **Admin:** Toàn quyền
- **User:** Chỉ xem/sửa dữ liệu của mình

---

## 📈 Best Practices

### **1. Giám sát thường xuyên:**
- Check logs hàng ngày
- Theo dõi tỷ lệ lỗi
- Xem báo cáo hiệu suất

### **2. Quản lý người dùng:**
- Xóa tài khoản spam
- Khóa tài khoản vi phạm
- Hỗ trợ người dùng khi cần

### **3. Cập nhật mẫu:**
- Thêm mẫu chứng chỉ mới
- Cải thiện regex patterns
- Test với ảnh thật

### **4. Backup dữ liệu:**
- Backup MongoDB định kỳ
- Lưu logs quan trọng
- Export dữ liệu thường xuyên

---

## 🐛 Troubleshooting

### **Không truy cập được Admin Panel:**
- Kiểm tra role trong MongoDB
- Đảm bảo đã đăng nhập
- Clear cache và reload

### **Statistics không hiển thị:**
- Kiểm tra MongoDB connection
- Xem server logs
- Restart backend

### **Không thể khóa/xóa user:**
- Kiểm tra adminAuth middleware
- Xem API response
- Check permissions

---

## 🎯 Tóm tắt

Admin Panel cung cấp:
- ✅ Quản lý người dùng đầy đủ
- ✅ Quản lý chứng chỉ
- ✅ Quản lý mẫu chứng chỉ
- ✅ Giám sát hệ thống real-time
- ✅ Báo cáo thống kê chi tiết
- ✅ System logs
- ✅ Xuất dữ liệu

**Truy cập:** http://localhost:3000/admin

**Chúc bạn quản trị hiệu quả! 👨‍💼**
