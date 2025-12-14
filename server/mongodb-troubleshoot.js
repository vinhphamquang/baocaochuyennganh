require('dotenv').config()

console.log('🔍 KIỂM TRA CẤU HÌNH MONGODB ATLAS')
console.log('=====================================')

// 1. Kiểm tra biến môi trường
console.log('1. Kiểm tra biến môi trường:')
const mongoUri = process.env.MONGODB_URI
if (!mongoUri) {
  console.log('❌ MONGODB_URI không được cấu hình trong .env')
  process.exit(1)
}

console.log('✅ MONGODB_URI đã được cấu hình')

// 2. Phân tích connection string
console.log('\n2. Phân tích connection string:')
try {
  const url = new URL(mongoUri.replace('mongodb+srv://', 'https://'))
  console.log('✅ Hostname:', url.hostname)
  console.log('✅ Username:', url.username)
  console.log('✅ Database:', mongoUri.split('/')[3]?.split('?')[0])
  
  if (url.password === '<db_password>' || url.password === '<password>') {
    console.log('❌ Mật khẩu chưa được thay thế!')
    console.log('💡 Hãy thay <db_password> bằng mật khẩu thực tế trong .env')
  } else {
    console.log('✅ Mật khẩu đã được cấu hình')
  }
} catch (error) {
  console.log('❌ Connection string không hợp lệ:', error.message)
}

// 3. Kiểm tra các tham số
console.log('\n3. Kiểm tra tham số connection:')
const params = new URLSearchParams(mongoUri.split('?')[1])
console.log('retryWrites:', params.get('retryWrites') || 'không có')
console.log('w:', params.get('w') || 'không có')
console.log('appName:', params.get('appName') || 'không có')

// 4. Hướng dẫn khắc phục
console.log('\n4. HƯỚNG DẪN KHẮC PHỤC:')
console.log('=====================================')
console.log('📋 Checklist để kết nối MongoDB Atlas:')
console.log('□ Thay <db_password> bằng mật khẩu thực tế')
console.log('□ Thêm IP address vào Network Access (0.0.0.0/0 cho development)')
console.log('□ Kiểm tra Database User có quyền readWrite')
console.log('□ Cluster đang chạy (không bị paused)')
console.log('□ Kết nối internet ổn định')

console.log('\n📝 Các lệnh hữu ích:')
console.log('- Test kết nối: npm run test-connection')
console.log('- Khởi động server: npm start')
console.log('- Xem logs: npm run dev')