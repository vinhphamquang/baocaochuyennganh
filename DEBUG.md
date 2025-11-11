# Hướng dẫn Debug và Khắc phục lỗi

## ✅ Trạng thái hiện tại

- **Backend**: http://localhost:5000 ✅ Đang chạy
- **Frontend**: http://localhost:3000 ✅ Đang chạy
- **MongoDB**: ✅ Đã kết nối

## 🔧 Đã sửa lỗi CORS

Đã cập nhật `server/server.js` để hỗ trợ cả port 3000 và 3001:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

## 🧪 Test API

### 1. Test trang debug
Mở: http://localhost:3000/test

Click nút "Test Register API" để kiểm tra kết nối

### 2. Test trực tiếp từ browser console

Mở Developer Tools (F12) và chạy:

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'Test User',
    email: 'test@example.com',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err))
```

## 📝 Checklist khi gặp lỗi "Failed to fetch"

### 1. Kiểm tra Backend đang chạy
```bash
curl http://localhost:5000/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","timestamp":"..."}
```

### 2. Kiểm tra CORS
Mở Developer Tools → Network tab
- Xem request có status 200 không
- Kiểm tra Response Headers có `Access-Control-Allow-Origin` không

### 3. Kiểm tra .env.local
File `.env.local` phải có:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Restart cả hai server
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

## 🐛 Các lỗi thường gặp

### Lỗi: "Failed to fetch"
**Nguyên nhân**: Backend không chạy hoặc CORS chưa được cấu hình
**Giải pháp**: 
1. Kiểm tra backend đang chạy
2. Kiểm tra CORS trong server.js
3. Restart cả hai server

### Lỗi: "Email đã được sử dụng"
**Nguyên nhân**: Email đã tồn tại trong database
**Giải pháp**: Dùng email khác hoặc xóa user cũ trong MongoDB

### Lỗi: "Network Error"
**Nguyên nhân**: Không kết nối được với backend
**Giải pháp**:
1. Kiểm tra backend đang chạy trên port 5000
2. Kiểm tra firewall không chặn port 5000
3. Thử truy cập trực tiếp: http://localhost:5000/api/health

## ✅ Test đăng ký thành công

1. Mở http://localhost:3000
2. Click "Đăng ký"
3. Điền thông tin:
   - Họ tên: Vinh Vinh
   - Email: vinh@gmail.com
   - Mật khẩu: 123456
   - Xác nhận: 123456
4. Click "Đăng ký"

Nếu thành công, bạn sẽ thấy:
- Toast notification "Đăng ký thành công!"
- Tự động đăng nhập
- Redirect về trang chủ

## 📊 Kiểm tra dữ liệu trong MongoDB

1. Vào https://cloud.mongodb.com
2. Click "Browse Collections"
3. Database: `certificate-extraction`
4. Collection: `users`
5. Xem user vừa tạo

## 🔍 Debug trong Browser

Mở Developer Tools (F12):

### Console Tab
Xem các log:
- API URL được gọi
- Request payload
- Response data
- Errors

### Network Tab
Xem các request:
- Status code
- Request headers
- Response headers
- Response body

## 📞 Liên hệ hỗ trợ

Nếu vẫn gặp lỗi, cung cấp thông tin:
1. Screenshot lỗi
2. Console logs
3. Network tab
4. Backend logs