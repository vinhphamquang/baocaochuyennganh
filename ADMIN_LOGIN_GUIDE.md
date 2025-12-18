# 🔐 Hướng dẫn đăng nhập Admin

## ✅ Trạng thái hệ thống

Hệ thống admin đã được cấu hình hoàn chỉnh với **1 tài khoản admin duy nhất**.

## 👤 Thông tin đăng nhập

```
📧 Email: admin@certificateextraction.com
🔒 Mật khẩu: admin123456
🌐 URL: http://localhost:3000/admin
```

## 📋 Các bước đăng nhập

### 1. Khởi động hệ thống
```bash
# Terminal 1: Khởi động backend
cd server
npm run dev

# Terminal 2: Khởi động frontend  
npm run dev
```

### 2. Truy cập trang admin
- Mở trình duyệt
- Vào địa chỉ: `http://localhost:3000/admin`
- Nhập thông tin đăng nhập ở trên

### 3. Đổi mật khẩu (khuyến nghị)
- Sau khi đăng nhập thành công
- Vào phần cài đặt tài khoản
- Đổi mật khẩu mặc định

## 🎯 Tính năng Admin Dashboard

### 📊 Tổng quan
- Thống kê người dùng
- Thống kê chứng chỉ đã xử lý
- Thống kê bình luận
- Hoạt động gần đây

### 👥 Quản lý người dùng
- Xem danh sách tất cả người dùng
- Khóa/mở khóa tài khoản
- Xóa tài khoản (không thể xóa admin)
- Xem hoạt động của từng user

### 📄 Quản lý chứng chỉ
- Xem tất cả chứng chỉ đã upload
- Theo dõi trạng thái xử lý
- Xóa chứng chỉ nếu cần

### 💬 Quản lý bình luận
- Duyệt bình luận của người dùng
- Xóa bình luận không phù hợp
- Báo cáo và khóa tài khoản vi phạm

### 📋 Nhật ký hệ thống
- Theo dõi tất cả hoạt động
- Xem lịch sử đăng nhập
- Giám sát bảo mật

## 🔒 Bảo mật đã được cấu hình

### ✅ Đã thực hiện:
- ❌ Xóa chức năng đăng ký admin
- 🔐 Chỉ 1 tài khoản admin duy nhất
- 🛡️ API bảo vệ không cho tạo admin mới
- 🗑️ Xóa tất cả admin thừa trong database
- 🔑 Password được hash bằng bcrypt
- 🚫 Middleware ngăn chặn truy cập trái phép

### 🚨 Lưu ý bảo mật:
1. **Đổi mật khẩu ngay**: Không sử dụng mật khẩu mặc định lâu dài
2. **Không chia sẻ**: Giữ bí mật thông tin đăng nhập
3. **Đăng xuất**: Luôn đăng xuất sau khi sử dụng
4. **Theo dõi logs**: Kiểm tra nhật ký thường xuyên

## 🧪 Test đã thực hiện

### ✅ Các test đã pass:
- Database connection: ✅
- Admin account creation: ✅
- Password hashing: ✅
- Login API: ✅
- Frontend access: ✅
- Security measures: ✅

## 🆘 Khắc phục sự cố

### Nếu không đăng nhập được:

1. **Kiểm tra server**:
```bash
cd server
npm run dev
# Đảm bảo server chạy trên port 5000
```

2. **Tạo lại admin**:
```bash
cd server
node recreate-admin.js
```

3. **Kiểm tra database**:
```bash
cd server
node check-admin.js
```

### Nếu quên mật khẩu:
```bash
cd server
node fix-admin-password.js
# Sẽ reset về mật khẩu mặc định: admin123456
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console browser (F12)
2. Kiểm tra logs server
3. Chạy các script khắc phục ở trên
4. Liên hệ developer

---

**Cập nhật**: 17/12/2024
**Trạng thái**: ✅ Sẵn sàng sử dụng
**Bảo mật**: 🔒 Đã được cấu hình đầy đủ
#
# 🆕 Tính năng mới đã thêm

### 🎯 Quản lý mẫu chứng chỉ
- **Xem danh sách mẫu**: Tất cả templates nhận dạng
- **Thống kê hiệu suất**: Độ chính xác, số lượng xử lý
- **Cập nhật patterns**: Chỉnh sửa regex patterns
- **Test mẫu**: Kiểm tra với ảnh thực tế
- **Quản lý trạng thái**: Bật/tắt mẫu

### 📊 Báo cáo thống kê nâng cao
- **Tổng quan hệ thống**: Metrics tổng thể
- **Phân tích xu hướng**: Thống kê theo thời gian
- **Top users**: Người dùng tích cực nhất
- **Phân bố chứng chỉ**: Theo loại và thời gian
- **Hiệu suất xử lý**: Thời gian, độ chính xác
- **Xuất báo cáo**: JSON, CSV formats

### 🔧 API Endpoints mới
```
GET /api/templates - Quản lý mẫu chứng chỉ
GET /api/reports/overview - Báo cáo tổng quan
GET /api/reports/performance - Báo cáo hiệu suất
GET /api/reports/certificates - Báo cáo chứng chỉ
GET /api/reports/users - Báo cáo người dùng
```

---

**Cập nhật**: 17/12/2024 - Thêm Templates & Reports
**Trạng thái**: ✅ Hoạt động đầy đủ