# 🔐 HỆ THỐNG QUẢN TRỊ ADMIN

## 📋 Tổng quan

Hệ thống admin cho phép quản lý users, certificates và xem thống kê.

---

## 🚀 Đăng ký Admin

### URL:
```
http://localhost:3000/admin/register
```

### Thông tin đăng ký:
- **Họ tên:** Tên của bạn
- **Email:** Email hợp lệ
- **Mật khẩu:** Ít nhất 6 ký tự
- **Xác nhận mật khẩu:** Phải khớp với mật khẩu
- **Mã Admin:** `ADMIN2024`

### Sau khi đăng ký:
- Tự động đăng nhập
- Redirect về Admin Dashboard
- Dữ liệu lưu trên MongoDB Atlas

---

## 🔑 Đăng nhập Admin

### URL:
```
http://localhost:3000/admin
```

### Thông tin đăng nhập:
- **Email:** Email đã đăng ký
- **Password:** Mật khẩu đã đặt

### Validation:
- Chỉ user có `role: "admin"` mới vào được
- User thường sẽ bị từ chối

---

## 📊 Admin Dashboard

### URL (sau khi đăng nhập):
```
http://localhost:3000/admin
```

### Các tab:

#### 1. 📊 Tổng quan
- Tổng số users
- Users hoạt động
- Tổng chứng chỉ
- Chứng chỉ hôm nay
- Tỷ lệ thành công

#### 2. 👥 Người dùng
- Danh sách users từ database
- Thông tin: Tên, Email, Role, Ngày tham gia
- Chức năng:
  - Khóa/Mở khóa tài khoản
  - Xóa user (có confirm)

#### 3. 📄 Chứng chỉ
- Danh sách certificates từ database
- Thông tin: File name, Loại, Trạng thái, Ngày tạo
- Phân loại theo màu sắc

#### 4. 📝 Nhật ký
- System logs (nếu có)

---

## 🗄️ Database

### MongoDB Atlas:
- **Cluster:** Chungchinn
- **Database:** certificate-extraction
- **Collections:**
  - `users` - Thông tin người dùng
  - `certificates` - Thông tin chứng chỉ

### User Schema:
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  isActive: Boolean,
  certificatesProcessed: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Backend API

### Auth Routes:
- `POST /api/auth/register` - Đăng ký (nhận `isAdmin: true` để tạo admin)
- `POST /api/auth/login` - Đăng nhập

### Admin Routes (cần token):
- `GET /api/admin/statistics` - Thống kê tổng quan
- `GET /api/admin/users` - Danh sách users
- `GET /api/admin/certificates` - Danh sách certificates
- `PUT /api/admin/users/:id/status` - Khóa/Mở khóa user
- `DELETE /api/admin/users/:id` - Xóa user

---

## 🔒 Bảo mật

### Mã Admin:
- Mặc định: `ADMIN2024`
- Có thể thay đổi trong: `app/admin/register/page.tsx`

### JWT Token:
- Lưu trong localStorage
- Expire: 7 ngày
- Secret: Trong `.env` file

### Password:
- Hash bằng bcrypt
- Salt rounds: 10

---

## 🧪 Testing

### Test đăng ký:
1. Truy cập `/admin/register`
2. Điền form với mã `ADMIN2024`
3. Submit → Tự động đăng nhập

### Test đăng nhập:
1. Đăng xuất: `localStorage.clear()`
2. Truy cập `/admin`
3. Đăng nhập với email/password
4. Vào dashboard

### Test chức năng:
1. Xem statistics
2. Khóa/Mở khóa user
3. Xem danh sách certificates

---

## 🔗 URLs quan trọng

- **Trang chủ:** http://localhost:3000
- **Đăng ký Admin:** http://localhost:3000/admin/register
- **Đăng nhập Admin:** http://localhost:3000/admin
- **Dashboard:** http://localhost:3000/dashboard
- **Backend API:** http://localhost:5000

---

## 📝 Notes

- Admin có thể quản lý tất cả users
- Dữ liệu lưu trên MongoDB Atlas Cloud
- Backend phải chạy trước khi test
- Frontend Next.js dev server: port 3000
- Backend Express server: port 5000

---

**Hệ thống admin hoạt động hoàn chỉnh! 🎉**
