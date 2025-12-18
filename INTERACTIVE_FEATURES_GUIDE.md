# 🎯 Hướng dẫn tính năng tương tác Admin Dashboard

## 🎨 Tổng quan tính năng mới

Admin Dashboard giờ đây đã có đầy đủ tính năng tương tác cho **Templates** và **Reports**!

## 🎯 Quản lý mẫu chứng chỉ (Templates)

### ✨ Tính năng có sẵn:

#### 1. **Xem danh sách templates**
- Hiển thị tất cả mẫu chứng chỉ
- Thống kê: Tổng mẫu, đang hoạt động, độ chính xác TB, đã xử lý
- Bảng chi tiết với thông tin hiệu suất

#### 2. **Thêm mẫu mới** ➕
- Click button "**+ Thêm mẫu mới**"
- Điền thông tin:
  - **Tên mẫu**: Tên mô tả cho template
  - **Loại chứng chỉ**: IELTS, TOEIC, VSTEP, TOEFL, HSK, JLPT, Khác
  - **Mô tả**: Mô tả chi tiết về mẫu
- Click "**Tạo mẫu**" để lưu

#### 3. **Chỉnh sửa mẫu** ✏️
- Click button "**✏️ Sửa**" trên mẫu muốn chỉnh sửa
- Modal sẽ mở với thông tin hiện tại
- Chỉnh sửa và click "**Cập nhật**"

#### 4. **Test mẫu** 🧪
- Click button "**🧪 Test**" để kiểm tra mẫu
- Hệ thống sẽ mô phỏng test và hiển thị kết quả:
  - Độ chính xác
  - Thời gian xử lý
  - Dữ liệu trích xuất mẫu

#### 5. **Bật/Tắt mẫu** ⏸️▶️
- Click button "**⏸️ Dừng**" để tạm dừng mẫu
- Click button "**▶️ Bật**" để kích hoạt lại mẫu
- Trạng thái sẽ cập nhật ngay lập tức

#### 6. **Xóa mẫu** 🗑️
- Click button "**🗑️ Xóa**"
- Xác nhận trong dialog
- Mẫu sẽ bị xóa vĩnh viễn

## 📊 Báo cáo thống kê (Reports)

### ✨ Tính năng có sẵn:

#### 1. **Bộ lọc báo cáo** 🔍
- **Từ ngày / Đến ngày**: Chọn khoảng thời gian
- **Loại chứng chỉ**: Lọc theo IELTS, TOEIC, VSTEP, TOEFL
- **Trạng thái**: Hoàn thành, Đang xử lý, Thất bại
- Click "**🔍 Áp dụng bộ lọc**" để cập nhật báo cáo

#### 2. **Xuất báo cáo** 📊📋
- **📊 Xuất JSON**: Tải báo cáo dạng JSON
- **📋 Xuất CSV**: Tải báo cáo dạng CSV
- File sẽ tự động download về máy

#### 3. **Dữ liệu thời gian thực** ⚡
- **Đang xử lý**: Số chứng chỉ đang được xử lý
- **Hàng đợi**: Số chứng chỉ chờ xử lý
- **User online**: Số người dùng đang online
- **Tải hệ thống**: Phần trăm tải của server
- **Tự động cập nhật**: Mỗi 30 giây

#### 4. **Thống kê tổng quan**
- Cards hiển thị metrics chính
- Charts phân bố theo loại chứng chỉ
- Top users tích cực nhất
- Thống kê 7 ngày gần nhất

## 🚀 Cách sử dụng

### Bước 1: Truy cập Admin
```
URL: http://localhost:3000/admin
Email: admin@certificateextraction.com
Password: admin123456
```

### Bước 2: Quản lý Templates
1. Click tab "**Mẫu chứng chỉ**"
2. Xem danh sách templates hiện có
3. Thử các tính năng:
   - Thêm mẫu mới
   - Chỉnh sửa mẫu
   - Test mẫu
   - Bật/tắt mẫu

### Bước 3: Xem báo cáo
1. Click tab "**Báo cáo**"
2. Thử bộ lọc:
   - Chọn ngày từ 01/12/2024 đến 17/12/2024
   - Chọn loại chứng chỉ IELTS
   - Click "Áp dụng bộ lọc"
3. Xuất báo cáo:
   - Click "Xuất JSON" hoặc "Xuất CSV"
4. Xem dữ liệu realtime tự động cập nhật

## 🎯 API Endpoints mới

### Templates:
```
POST /api/templates - Tạo template mới
PUT /api/templates/:id - Cập nhật template
DELETE /api/templates/:id - Xóa template
POST /api/templates/:id/toggle - Bật/tắt template
POST /api/templates/:id/test - Test template
```

### Reports:
```
GET /api/reports/overview?filters - Báo cáo với filters
GET /api/reports/performance?filters - Báo cáo hiệu suất
GET /api/reports/certificates?page&limit - Báo cáo chứng chỉ
GET /api/reports/users?sortBy - Báo cáo người dùng
POST /api/reports/export - Xuất báo cáo
GET /api/reports/realtime - Dữ liệu realtime
```

## 🔧 Tính năng kỹ thuật

### Templates:
- ✅ CRUD operations đầy đủ
- ✅ Real-time status updates
- ✅ Mock test functionality
- ✅ Form validation
- ✅ Error handling

### Reports:
- ✅ Dynamic filters
- ✅ Export functionality (JSON/CSV)
- ✅ Realtime data updates
- ✅ Pagination support
- ✅ Date range filtering

## 🎨 UI/UX Features

### Interactive Elements:
- ✅ Modal dialogs
- ✅ Form inputs với validation
- ✅ Hover effects
- ✅ Loading states
- ✅ Toast notifications
- ✅ Confirmation dialogs

### Responsive Design:
- ✅ Mobile-friendly
- ✅ Grid layouts
- ✅ Flexible cards
- ✅ Scrollable tables

## 🚨 Lưu ý

1. **Mock Data**: Hiện tại sử dụng mock data để demo
2. **Real Implementation**: Có thể tích hợp với database thực
3. **Performance**: Realtime updates mỗi 30 giây
4. **Security**: Tất cả endpoints yêu cầu admin auth

---

**Trạng thái**: ✅ Hoàn thành và sẵn sàng sử dụng
**Ngày cập nhật**: 17/12/2024
**Tác giả**: Kiro AI Assistant