# 🚀 BẮT ĐẦU SỬ DỤNG

## ✅ HỆ THỐNG ĐÃ SẴN SÀNG!

**Backend**: http://localhost:5000 ✅
**Frontend**: http://localhost:3000 ✅
**MongoDB**: ✅ Đã kết nối

---

## 📝 HƯỚNG DẪN NHANH

### 1. MỞ WEBSITE
Truy cập: **http://localhost:3000**

### 2. ĐĂNG KÝ TÀI KHOẢN
1. Click nút **"Đăng ký"** (góc phải trên)
2. Điền thông tin:
   - Họ tên: **Vinh Vinh**
   - Email: **vinh123@gmail.com**
   - Mật khẩu: **123456**
   - Xác nhận: **123456**
3. Tick ☑️ "Tôi đồng ý..."
4. Click **"Đăng ký"**

### 3. ĐĂNG NHẬP
1. Click **"Đăng nhập"**
2. Nhập email và mật khẩu
3. Click **"Đăng nhập"**

---

## 🎨 GIAO DIỆN

Website có màu **xanh dương** và **trắng** làm chủ đạo:
- Header: Trắng với logo xanh
- Buttons: Xanh dương (#2563eb)
- Background: Gradient xanh nhạt đến trắng

---

## ✨ TÍNH NĂNG

- ✅ Đăng ký/Đăng nhập
- ✅ Show/hide password (icon mắt 👁️)
- ✅ Validation form đầy đủ
- ✅ Lưu token vào Cookie
- ✅ Kết nối MongoDB Atlas
- ✅ Responsive design

---

## 🔧 NẾU GẶP VẤN ĐỀ

### CSS không hiển thị đúng?
1. Nhấn **Ctrl + Shift + R** (hard refresh)
2. Xóa cache trình duyệt
3. Thử trình duyệt khác

### "Failed to fetch"?
1. Kiểm tra backend: http://localhost:5000/api/health
2. Nếu không mở được → Khởi động lại backend:
   ```bash
   cd server
   npm run dev
   ```

### Port đã được sử dụng?
```bash
# Kill process trên port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process trên port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📊 KIỂM TRA DỮ LIỆU

Sau khi đăng ký, kiểm tra trong MongoDB Atlas:
1. Vào https://cloud.mongodb.com
2. Browse Collections
3. Database: `certificate-extraction`
4. Collection: `users`
5. Xem user vừa tạo

---

## 🎯 CHECKLIST

- [x] Backend đang chạy (port 5000)
- [x] Frontend đang chạy (port 3000)
- [x] MongoDB đã kết nối
- [x] CORS đã cấu hình
- [x] CSS đã load đúng

---

## 📞 TÀI LIỆU KHÁC

- `HUONG_DAN_SU_DUNG.md` - Hướng dẫn chi tiết
- `DEBUG.md` - Hướng dẫn debug
- `README.md` - Thông tin dự án

---

## 🎉 CHÚC BẠN SỬ DỤNG THÀNH CÔNG!

Mở ngay: **http://localhost:3000**