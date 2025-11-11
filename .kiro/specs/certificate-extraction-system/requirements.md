# Requirements Document

## Introduction

Hệ thống trích xuất thông tin chứng chỉ ngoại ngữ là một ứng dụng web toàn diện cho phép người dùng tải lên chứng chỉ ngoại ngữ (IELTS, TOEFL, TOEIC, HSK, JLPT) và tự động trích xuất thông tin bằng công nghệ OCR và AI. Hệ thống hỗ trợ hai vai trò chính: User (người dùng thông thường) và Admin (quản trị viên).

## Glossary

- **System**: Hệ thống trích xuất thông tin chứng chỉ ngoại ngữ
- **User**: Người dùng thông thường có tài khoản trong hệ thống
- **Admin**: Quản trị viên có quyền quản lý toàn bộ hệ thống
- **Certificate**: Chứng chỉ ngoại ngữ được tải lên hệ thống
- **OCR**: Optical Character Recognition - Công nghệ nhận dạng ký tự quang học
- **Extraction**: Quá trình trích xuất thông tin từ chứng chỉ
- **Session**: Phiên đăng nhập của người dùng
- **Token**: JWT token để xác thực người dùng
- **Upload**: Quá trình tải file lên hệ thống
- **Export**: Xuất dữ liệu ra các định dạng khác

## Requirements

### Requirement 1: Xác thực và Phân quyền

**User Story:** Là một người dùng, tôi muốn đăng ký và đăng nhập vào hệ thống để có thể sử dụng các tính năng trích xuất chứng chỉ

#### Acceptance Criteria

1. WHEN a User submits valid registration information, THE System SHALL create a new User account with role "user"
2. WHEN a User submits valid login credentials, THE System SHALL generate a JWT Token valid for 7 days
3. WHEN a User accesses protected routes without valid Token, THE System SHALL redirect to login page
4. WHEN an Admin logs in, THE System SHALL grant access to admin dashboard and all admin functions
5. THE System SHALL hash User passwords using bcrypt with salt rounds of 10 before storing in database

### Requirement 2: Tải lên Chứng chỉ

**User Story:** Là một User, tôi muốn tải lên chứng chỉ ngoại ngữ của mình để hệ thống trích xuất thông tin tự động

#### Acceptance Criteria

1. WHEN a User uploads a file, THE System SHALL validate file type is JPG, PNG, or PDF
2. WHEN a User uploads a file, THE System SHALL validate file size does not exceed 10MB
3. WHEN file validation passes, THE System SHALL store the file and create a Certificate record with status "processing"
4. WHEN file validation fails, THE System SHALL display error message indicating the specific validation failure
5. THE System SHALL support drag-and-drop file upload interface

### Requirement 3: Trích xuất Thông tin Tự động

**User Story:** Là một User, tôi muốn hệ thống tự động trích xuất thông tin từ chứng chỉ để tiết kiệm thời gian nhập liệu thủ công

#### Acceptance Criteria

1. WHEN a Certificate is uploaded, THE System SHALL process the file using OCR technology within 30 seconds
2. WHEN OCR processing completes successfully, THE System SHALL extract fields: full name, date of birth, certificate number, test date, issue date, scores, issuing organization
3. WHEN OCR processing completes, THE System SHALL update Certificate status to "completed" and store extracted data
4. WHEN OCR processing fails, THE System SHALL update Certificate status to "failed" and log error message
5. THE System SHALL calculate OCR confidence score and store it with extracted data

### Requirement 4: Hiển thị và Chỉnh sửa Kết quả

**User Story:** Là một User, tôi muốn xem và chỉnh sửa thông tin đã trích xuất để đảm bảo tính chính xác

#### Acceptance Criteria

1. WHEN extraction completes, THE System SHALL display all extracted fields in editable form
2. WHEN a User modifies extracted data, THE System SHALL validate data format before saving
3. WHEN a User saves modifications, THE System SHALL update Certificate record with new data
4. THE System SHALL highlight fields with low confidence score (below 80 percent) for User review
5. THE System SHALL display original certificate image alongside extracted data for comparison

### Requirement 5: Lịch sử Trích xuất

**User Story:** Là một User, tôi muốn xem lịch sử các chứng chỉ đã trích xuất để quản lý và tra cứu dễ dàng

#### Acceptance Criteria

1. WHEN a User accesses dashboard, THE System SHALL display list of all Certificates processed by that User
2. THE System SHALL sort Certificate history by creation date in descending order
3. WHEN a User clicks on a Certificate, THE System SHALL display detailed extraction results
4. THE System SHALL display Certificate processing status: pending, processing, completed, or failed
5. THE System SHALL allow User to filter Certificates by type, date range, and status

### Requirement 6: Xuất Dữ liệu

**User Story:** Là một User, tôi muốn xuất dữ liệu đã trích xuất ra các định dạng khác để sử dụng cho mục đích khác

#### Acceptance Criteria

1. WHEN a User requests data export, THE System SHALL support formats: JSON, CSV, and Excel
2. WHEN exporting to CSV, THE System SHALL include all extracted fields as columns
3. WHEN exporting to Excel, THE System SHALL format data with headers and proper column widths
4. WHEN exporting to JSON, THE System SHALL include complete Certificate data with metadata
5. THE System SHALL generate export file within 5 seconds for single Certificate

### Requirement 7: Quản lý Người dùng (Admin)

**User Story:** Là một Admin, tôi muốn quản lý tài khoản người dùng để đảm bảo an toàn và kiểm soát hệ thống

#### Acceptance Criteria

1. WHEN an Admin accesses user management, THE System SHALL display list of all Users with their status
2. WHEN an Admin deactivates a User account, THE System SHALL set User status to inactive and invalidate all active Tokens
3. WHEN an Admin activates a User account, THE System SHALL set User status to active
4. WHEN an Admin deletes a User account, THE System SHALL remove User record and all associated Certificates
5. THE System SHALL display User statistics: total users, active users, certificates processed per user

### Requirement 8: Quản lý Mẫu Chứng chỉ (Admin)

**User Story:** Là một Admin, tôi muốn quản lý các mẫu chứng chỉ để hệ thống có thể nhận dạng chính xác các loại chứng chỉ mới

#### Acceptance Criteria

1. WHEN an Admin adds new certificate template, THE System SHALL store template configuration with field mappings
2. WHEN an Admin updates template, THE System SHALL apply changes to future extractions only
3. WHEN an Admin deletes template, THE System SHALL prevent deletion if Certificates using that template exist
4. THE System SHALL support templates for certificate types: IELTS, TOEFL, TOEIC, HSK, JLPT
5. THE System SHALL allow Admin to define custom field extraction rules for each template

### Requirement 9: Giám sát Hệ thống (Admin)

**User Story:** Là một Admin, tôi muốn giám sát hoạt động của hệ thống để phát hiện và xử lý vấn đề kịp thời

#### Acceptance Criteria

1. WHEN an Admin accesses system monitoring, THE System SHALL display real-time system health status
2. THE System SHALL log all errors with timestamp, error type, and stack trace
3. WHEN system error occurs, THE System SHALL send notification to Admin
4. THE System SHALL display system metrics: API response time, database connection status, OCR service status
5. THE System SHALL maintain system logs for minimum 30 days

### Requirement 10: Báo cáo Thống kê (Admin)

**User Story:** Là một Admin, tôi muốn xem báo cáo thống kê để đánh giá hiệu suất và sử dụng của hệ thống

#### Acceptance Criteria

1. WHEN an Admin accesses statistics, THE System SHALL display total Certificates processed by date range
2. THE System SHALL calculate and display average processing time per Certificate
3. THE System SHALL display success rate: completed Certificates divided by total Certificates
4. THE System SHALL display Certificates breakdown by type: IELTS, TOEFL, TOEIC, HSK, JLPT
5. THE System SHALL allow Admin to export statistics report as PDF or Excel

### Requirement 11: Bảo mật Dữ liệu

**User Story:** Là một User, tôi muốn dữ liệu cá nhân và chứng chỉ của mình được bảo mật để đảm bảo quyền riêng tư

#### Acceptance Criteria

1. THE System SHALL encrypt all sensitive data at rest using AES-256 encryption
2. THE System SHALL use HTTPS for all client-server communications
3. WHEN a Certificate is processed, THE System SHALL delete uploaded file after 30 days
4. THE System SHALL implement rate limiting: maximum 100 requests per 15 minutes per IP address
5. THE System SHALL log all access to sensitive data with User ID and timestamp

### Requirement 12: Hiệu suất Hệ thống

**User Story:** Là một User, tôi muốn hệ thống xử lý nhanh chóng để không phải chờ đợi lâu

#### Acceptance Criteria

1. THE System SHALL process OCR extraction within 30 seconds for 95 percent of Certificates
2. THE System SHALL respond to API requests within 2 seconds for 99 percent of requests
3. THE System SHALL support concurrent processing of minimum 10 Certificates
4. THE System SHALL cache frequently accessed data to improve response time
5. THE System SHALL optimize database queries to execute within 100 milliseconds

### Requirement 13: Thông báo và Cảnh báo

**User Story:** Là một User, tôi muốn nhận thông báo khi quá trình trích xuất hoàn tất để biết khi nào có thể xem kết quả

#### Acceptance Criteria

1. WHEN extraction completes successfully, THE System SHALL display success notification to User
2. WHEN extraction fails, THE System SHALL display error notification with reason
3. WHEN User uploads invalid file, THE System SHALL display validation error immediately
4. THE System SHALL display loading indicator during file upload and processing
5. THE System SHALL display toast notifications that auto-dismiss after 5 seconds

### Requirement 14: Responsive Design

**User Story:** Là một User, tôi muốn sử dụng hệ thống trên các thiết bị khác nhau để có thể truy cập mọi lúc mọi nơi

#### Acceptance Criteria

1. THE System SHALL display correctly on desktop screens with minimum width 1024 pixels
2. THE System SHALL display correctly on tablet screens with width 768 to 1023 pixels
3. THE System SHALL display correctly on mobile screens with width 320 to 767 pixels
4. THE System SHALL adapt navigation menu to hamburger menu on screens below 768 pixels width
5. THE System SHALL ensure all interactive elements are touch-friendly with minimum 44 pixels touch target

### Requirement 15: Khả năng Mở rộng

**User Story:** Là một Admin, tôi muốn hệ thống có thể mở rộng để hỗ trợ thêm loại chứng chỉ và tính năng mới

#### Acceptance Criteria

1. THE System SHALL use modular architecture to allow adding new certificate types without modifying core code
2. THE System SHALL provide API endpoints for third-party integrations
3. THE System SHALL support plugin system for custom OCR providers
4. THE System SHALL use configuration files for system settings to avoid code changes
5. THE System SHALL document all APIs using OpenAPI specification