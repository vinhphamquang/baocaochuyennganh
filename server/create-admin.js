const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createDefaultAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️ Đã tồn tại tài khoản admin:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Tên: ${existingAdmin.fullName}`);
      console.log(`   ID: ${existingAdmin._id}`);
      return;
    }

    // Tạo tài khoản admin mặc định
    const adminData = {
      fullName: 'Administrator',
      email: 'admin@certificateextraction.com',
      password: 'admin123456', // Nên đổi mật khẩu sau khi đăng nhập
      role: 'admin',
      isActive: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('🎉 Đã tạo tài khoản admin mặc định thành công!');
    console.log('📧 Email: admin@certificateextraction.com');
    console.log('🔒 Mật khẩu: admin123456');
    console.log('⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
createDefaultAdmin();