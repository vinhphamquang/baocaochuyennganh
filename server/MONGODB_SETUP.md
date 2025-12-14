# Hướng dẫn kết nối MongoDB Atlas

## 🚀 Các bước thiết lập

### 1. Cấu hình Connection String
Mở file `server/.env` và thay thế `<your_actual_password>` bằng mật khẩu thực tế:

```env
MONGODB_URI=mongodb+srv://dinh1234%40admin:YOUR_ACTUAL_PASSWORD@chungchinn.ngxtvng.mongodb.net/certificate-extraction?retryWrites=true&w=majority&appName=Chungchinn
```

### 2. Kiểm tra MongoDB Atlas Dashboard

#### Network Access:
- Vào MongoDB Atlas Dashboard
- Chọn "Network Access" 
- Thêm IP address: `0.0.0.0/0` (cho development)
- Hoặc thêm IP cụ thể của máy bạn

#### Database Access:
- Chọn "Database Access"
- Kiểm tra user `dinh1234@admin` có quyền `readWrite`
- Nếu chưa có, tạo user mới với quyền `readWrite`

#### Cluster Status:
- Kiểm tra cluster `Chungchinn` đang chạy (không bị paused)

### 3. Test kết nối

```bash
# Kiểm tra cấu hình
npm run troubleshoot

# Test kết nối
npm run test-connection

# Khởi động server
npm run dev
```

## 🔧 Khắc phục sự cố

### Lỗi Authentication Failed
```
MongoServerError: bad auth : authentication failed
```
**Giải pháp:**
- Kiểm tra username/password trong connection string
- Đảm bảo user có quyền truy cập database

### Lỗi Network Timeout
```
MongoNetworkTimeoutError: connection timed out
```
**Giải pháp:**
- Kiểm tra Network Access trong MongoDB Atlas
- Thêm IP address vào whitelist
- Kiểm tra kết nối internet

### Lỗi ENOTFOUND
```
MongoNetworkError: getaddrinfo ENOTFOUND
```
**Giải pháp:**
- Kiểm tra connection string
- Đảm bảo cluster name đúng
- Kiểm tra DNS resolution

## 📝 Scripts hữu ích

| Script | Mô tả |
|--------|-------|
| `npm run troubleshoot` | Kiểm tra cấu hình và đưa ra gợi ý |
| `npm run test-connection` | Test kết nối MongoDB Atlas |
| `npm start` | Khởi động server production |
| `npm run dev` | Khởi động server development với nodemon |

## 🔍 Monitoring

Server sẽ log các sự kiện kết nối:
- ✅ Kết nối thành công
- ❌ Lỗi kết nối
- 🔄 Thử kết nối lại
- 📤 Ngắt kết nối

## 🛡️ Security Best Practices

1. **Không commit mật khẩu** vào git
2. **Sử dụng IP whitelist** thay vì 0.0.0.0/0 trong production
3. **Tạo user riêng** cho từng environment
4. **Enable audit logging** trong MongoDB Atlas
5. **Sử dụng connection pooling** (đã cấu hình sẵn)