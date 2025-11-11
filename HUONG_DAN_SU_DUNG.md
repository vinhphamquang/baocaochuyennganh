# 📖 HƯỚNG DẪN SỬ DỤNG WEBSITE TRÍCH XUẤT CHỨNG CHỈ

## ✅ KIỂM TRA HỆ THỐNG

### 1. Kiểm tra Backend đang chạy
Mở trình duyệt và truy cập: **http://localhost:5000/api/health**

Nếu thấy:
```json
{"status":"OK","timestamp":"..."}
```
→ Backend đang hoạt động ✅

### 2. Kiểm tra Frontend đang chạy
Truy cập: **http://localhost:3001** (hoặc http://localhost:3000)

Nếu thấy trang chủ với tiêu đề "Trích xuất thông tin chứng chỉ ngoại ngữ tự động"
→ Frontend đang hoạt động ✅

### 3. Test kết nối API
Mở file `test-cors.html` trong trình duyệt:
- Click chuột phải vào file → Open with → Chrome/Edge
- Click nút "Test Register"
- Nếu thấy "Register Success" → API hoạt động ✅

## 🚀 CÁCH SỬ DỤNG

### ĐĂNG KÝ TÀI KHOẢN

1. Mở **http://localhost:3001**
2. Click nút **"Đăng ký"** ở góc phải trên
3. Điền thông tin:
   ```
   Họ và tên: Nguyễn Văn A
   Email: nguyenvana@gmail.com
   Mật khẩu: 123456 (tối thiểu 6 ký tự)
   Xác nhận mật khẩu: 123456
   ```
4. Click icon 👁️ để xem/ẩn mật khẩu
5. Tick vào ☑️ "Tôi đồng ý với Điều khoản sử dụng"
6. Click nút **"Đăng ký"**

**Kết quả mong đợi:**
- Thông báo "Đăng ký thành công!" màu xanh
- Tự động đăng nhập
- Chuyển về trang chủ

### ĐĂNG NHẬP

1. Click nút **"Đăng nhập"**
2. Nhập:
   ```
   Email: nguyenvana@gmail.com
   Mật khẩu: 123456
   ```
3. (Tùy chọn) Tick "Ghi nhớ đăng nhập"
4. Click **"Đăng nhập"**

**Kết quả mong đợi:**
- Thông báo "Đăng nhập thành công!"
- Hiển thị tên người dùng ở góc phải
- Có thể truy cập Dashboard

## 🔧 KHẮC PHỤC LỖI "FAILED TO FETCH"

### Nguyên nhân:
Backend không chạy hoặc không kết nối được

### Giải pháp:

#### Bước 1: Kiểm tra Backend
```bash
# Mở Command Prompt/PowerShell
cd D:\Baocao_ChuyenNganh\server
npm run dev
```

Phải thấy:
```
Server đang chạy trên port 5000
MongoDB connected
```

#### Bước 2: Kiểm tra Frontend
```bash
# Mở Command Prompt/PowerShell mới
cd D:\Baocao_ChuyenNganh
npm run dev
```

Phải thấy:
```
▲ Next.js 14.0.0
- Local: http://localhost:3001
✓ Ready in 2.6s
```

#### Bước 3: Test API
Mở trình duyệt, nhấn F12 (Developer Tools), vào tab Console, chạy:

```javascript
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ Backend OK:', data))
  .catch(err => console.error('❌ Backend Error:', err))
```

#### Bước 4: Thử đăng ký lại
Nếu 3 bước trên OK, thử đăng ký với email MỚI (chưa dùng)

## 📊 KIỂM TRA DỮ LIỆU TRONG MONGODB

1. Vào https://cloud.mongodb.com
2. Đăng nhập
3. Click **"Browse Collections"**
4. Chọn:
   - Database: `certificate-extraction`
   - Collection: `users`
5. Xem danh sách user đã đăng ký

## 🐛 CÁC LỖI THƯỜNG GẶP

### 1. "Failed to fetch"
**Nguyên nhân**: Backend không chạy
**Giải pháp**: Khởi động lại backend (xem Bước 1 ở trên)

### 2. "Email đã được sử dụng"
**Nguyên nhân**: Email đã tồn tại trong database
**Giải pháp**: Dùng email khác

### 3. "Mật khẩu phải có ít nhất 6 ký tự"
**Nguyên nhân**: Mật khẩu quá ngắn
**Giải pháp**: Nhập mật khẩu >= 6 ký tự

### 4. "Mật khẩu xác nhận không khớp"
**Nguyên nhân**: Hai ô mật khẩu không giống nhau
**Giải pháp**: Nhập lại cho giống nhau

### 5. Port 3000 hoặc 5000 đã được sử dụng
**Giải pháp**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## 📞 HỖ TRỢ

Nếu vẫn gặp lỗi, cung cấp:
1. Screenshot lỗi
2. Console logs (F12 → Console tab)
3. Network logs (F12 → Network tab)
4. Backend terminal logs

## ✨ TÍNH NĂNG

- ✅ Đăng ký/Đăng nhập
- ✅ Show/hide password
- ✅ Validation form
- ✅ Lưu token vào Cookie
- ✅ Kết nối MongoDB Atlas
- ✅ Mã hóa mật khẩu (bcrypt)
- ✅ JWT authentication
- ✅ CORS đã cấu hình
- ✅ Error handling

## 🎯 CHECKLIST TRƯỚC KHI SỬ DỤNG

- [ ] Backend đang chạy (port 5000)
- [ ] Frontend đang chạy (port 3001)
- [ ] MongoDB đã kết nối
- [ ] Test API thành công
- [ ] Đã đọc hướng dẫn

Chúc bạn sử dụng thành công! 🎉