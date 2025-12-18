const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateAdminAccount() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm tài khoản admin hiện tại
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('❌ Không tìm thấy tài khoản admin nào');
      return;
    }

    console.log('📋 Tài khoản admin hiện tại:');
    console.log(`   ID: ${existingAdmin._id}`);
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Tên: ${existingAdmin.fullName}`);
    console.log(`   Trạng thái: ${existingAdmin.isActive ? 'Hoạt động' : 'Khóa'}`);

    // Cập nhật thông tin admin
    const updatedAdmin = await User.findByIdAndUpdate(
      existingAdmin._id,
      {
        fullName: 'Administrator',
        email: 'admin@certificateextraction.com',
        password: 'admin123456', // Sẽ được hash tự động
        isActive: true
      },
      { new: true }
    );

    console.log('\n🎉 Đã cập nhật tài khoản admin thành công!');
    console.log('📧 Email mới: admin@certificateextraction.com');
    console.log('🔒 Mật khẩu mới: admin123456');
    console.log('⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu!');
    
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
updateAdminAccount();