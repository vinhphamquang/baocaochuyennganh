const mongoose = require('mongoose')
require('dotenv').config()

const testConnection = async () => {
  try {
    console.log('Đang test kết nối MongoDB Atlas...')
    console.log('URI:', process.env.MONGODB_URI ? 'Đã cấu hình' : 'Chưa cấu hình')
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    })
    
    console.log('✅ Kết nối MongoDB Atlas thành công!')
    console.log('Host:', conn.connection.host)
    console.log('Database:', conn.connection.name)
    console.log('Ready state:', conn.connection.readyState)
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    await mongoose.connection.close()
    console.log('Đã đóng kết nối test')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB Atlas:')
    console.error('Message:', error.message)
    
    if (error.message.includes('authentication failed')) {
      console.error('🔑 Lỗi xác thực - Kiểm tra username/password')
    } else if (error.message.includes('network')) {
      console.error('🌐 Lỗi mạng - Kiểm tra kết nối internet và IP whitelist')
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 Không tìm thấy cluster - Kiểm tra connection string')
    }
    
    process.exit(1)
  }
}

testConnection()