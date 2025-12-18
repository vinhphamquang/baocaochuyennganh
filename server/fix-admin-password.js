const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixAdminPassword() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm tài khoản admin
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('❌ Không tìm thấy tài khoản admin');
      return;
    }

    console.log('📋 Tài khoản admin hiện tại:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Tên: ${admin.fullName}`);
    console.log(`   Password hash cũ: ${admin.password.substring(0, 20)}...`);

    // Cập nhật mật khẩu bằng cách save() để trigger middleware
    admin.password = 'admin123456';
    await admin.save(); // Sẽ tự động hash password

    console.log('\n🎉 Đã cập nhật mật khẩu admin thành công!');
    console.log(`   Password hash mới: ${admin.password.substring(0, 20)}...`);
    
    // Test password
    const isMatch = await admin.comparePassword('admin123456');
    console.log(`   🧪 Test password: ${isMatch ? '✅ ĐÚNG' : '❌ SAI'}`);

    console.log('\n📧 Thông tin đăng nhập:');
    console.log('   Email: admin@certificateextraction.com');
    console.log('   Password: admin123456');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
fixAdminPassword();