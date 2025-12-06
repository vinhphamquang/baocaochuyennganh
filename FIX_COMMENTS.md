# Sửa lỗi "Không thể tải bình luận"

## Vấn đề
Trang web hiển thị lỗi "Không thể tải bình luận" khi tải trang chủ.

## Nguyên nhân
Server backend chưa được khởi động, dẫn đến frontend không thể kết nối đến API.

## Giải pháp đã thực hiện

### 1. Cải thiện Error Handling
- Thêm thông báo lỗi chi tiết hơn trong `app/components/Testimonials.tsx`
- Cải thiện xử lý lỗi network trong `lib/api.ts`

### 2. Tạo Script Test
- Tạo `server/test-comments.js` để kiểm tra kết nối MongoDB và comments
- Kết quả: MongoDB kết nối thành công, có 2 comments trong database

### 3. Khởi động Server
- Chạy server backend: `npm start` trong thư mục `server`
- Server đang chạy trên port 5000
- API endpoint `/api/comments` hoạt động bình thường

## Kết quả
✅ Server backend đã chạy thành công
✅ MongoDB kết nối thành công
✅ API comments trả về dữ liệu đúng
✅ Frontend có thể tải bình luận

## Hướng dẫn sử dụng

### Khởi động hệ thống
1. Mở terminal trong thư mục `server`:
   ```bash
   cd server
   npm start
   ```

2. Mở terminal khác trong thư mục gốc:
   ```bash
   npm run dev
   ```

3. Truy cập http://localhost:3000

### Kiểm tra Comments
- Chạy test: `node server/test-comments.js`
- Kiểm tra API: `curl http://localhost:5000/api/comments`

## Lưu ý
- Luôn đảm bảo server backend chạy trước khi khởi động frontend
- Kiểm tra MongoDB connection trong file `server/.env`
- Server cần chạy trên port 5000 (hoặc cấu hình trong NEXT_PUBLIC_API_URL)
