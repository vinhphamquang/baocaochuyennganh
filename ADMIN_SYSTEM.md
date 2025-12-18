# 🔐 Hệ thống Admin - Tài khoản duy nhất

## 📋 Tổng quan

Hệ thống đã được cấu hình để **chỉ có 1 tài khoản admin duy nhất** nhằm đảm bảo bảo mật và kiểm soát truy cập.

## 👤 Tài khoản Admin mặc định

```
📧 Email: admin@certificateextraction.com
🔒 Mật khẩu: admin123456
👤 Tên: Administrator
🔑 Vai trò: admin
✅ Trạng thái: Đã được tạo và test thành công
```

⚠️ **Quan trọng**: Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu!

## 🚫 Các thay đổi đã thực hiện

### 1. Xóa bỏ chức năng đăng ký admin
- ❌ Đã xóa trang `/admin/register`
- ❌ API không cho phép tạo tài khoản admin mới
- ❌ Xóa link "Đăng ký Admin" khỏi trang đăng nhập

### 2. Bảo vệ API
```javascript
// Trong /api/auth/register
if (isAdmin) {
  return res.status(403).json({ 
    message: 'Không được phép đăng ký tài khoản admin' 
  })
}
```

### 3. Dọn dẹp database
- 🗑️ Đã xóa tất cả tài khoản admin thừa
- ✅ Chỉ giữ lại 1 tài khoản admin chính thức

## 🛠️ Scripts quản lý

### Tạo tài khoản admin mặc định
```bash
cd server
node create-admin.js
```

### Cập nhật thông tin admin
```bash
cd server
node update-admin.js
```

### Đảm bảo chỉ có 1 admin
```bash
cd server
node prevent-multiple-admins.js
```

## 🔒 Bảo mật

### Các biện pháp bảo vệ:
1. **API Protection**: Không cho phép tạo admin qua API
2. **Single Admin**: Chỉ 1 tài khoản admin duy nhất
3. **UI Removal**: Xóa giao diện đăng ký admin
4. **Database Cleanup**: Dọn dẹp admin thừa

### Quyền hạn admin:
- ✅ Quản lý người dùng (xem, khóa, xóa)
- ✅ Quản lý chứng chỉ (xem, xóa)
- ✅ Quản lý bình luận (duyệt, xóa, báo cáo)
- ✅ Xem thống kê hệ thống
- ✅ Xem nhật ký hoạt động

## 🚪 Truy cập Admin

### URL: `/admin`
1. Truy cập trang admin
2. Đăng nhập bằng tài khoản mặc định
3. Đổi mật khẩu ngay lập tức
4. Bắt đầu quản lý hệ thống

### Tính năng chính:
- 📊 **Tổng quan**: Thống kê tổng thể
- 👥 **Người dùng**: Quản lý tài khoản user
- 📄 **Chứng chỉ**: Theo dõi xử lý chứng chỉ
- 💬 **Bình luận**: Kiểm duyệt feedback
- 📋 **Nhật ký**: Theo dõi hoạt động hệ thống

## ⚠️ Lưu ý quan trọng

1. **Không tạo admin mới**: Hệ thống chỉ hỗ trợ 1 admin
2. **Đổi mật khẩu**: Thay đổi mật khẩu mặc định ngay
3. **Backup**: Sao lưu thông tin admin thường xuyên
4. **Monitoring**: Theo dõi nhật ký truy cập admin

## 🔄 Khôi phục Admin

Nếu mất tài khoản admin:

```bash
# 1. Tạo lại admin mặc định
cd server
node create-admin.js

# 2. Hoặc cập nhật admin hiện tại
node update-admin.js

# 3. Đảm bảo chỉ có 1 admin
node prevent-multiple-admins.js
```

## 📞 Hỗ trợ

Nếu gặp vấn đề với tài khoản admin:
1. Chạy script khôi phục
2. Kiểm tra logs hệ thống
3. Liên hệ developer để hỗ trợ

---

**Cập nhật cuối**: $(date)
**Trạng thái**: ✅ Hoạt động bình thường
**Admin count**: 1/1