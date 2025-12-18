const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function recreateAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa tất cả admin hiện tại
    const deletedAdmins = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️ Đã xóa ${deletedAdmins.deletedCount} tài khoản admin cũ`);

    // Tạo admin mới từ đầu
    const adminData = {
      fullName: 'Administrator',
      email: 'admin@certificateextraction.com',
      password: 'admin123456',
      role: 'admin',
      isActive: true
    };

    console.log('🔨 Tạo admin mới...');
    const newAdmin = new User(adminData);
    await newAdmin.save(); // Sẽ tự động hash password qua middleware

    console.log('🎉 Đã tạo admin mới thành công!');
    console.log(`   ID: ${newAdmin._id}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Tên: ${newAdmin.fullName}`);
    console.log(`   Password hash: ${newAdmin.password.substring(0, 30)}...`);
    
    // Test password
    const isMatch = await newAdmin.comparePassword('admin123456');
    console.log(`   🧪 Test password 'admin123456': ${isMatch ? '✅ ĐÚNG' : '❌ SAI'}`);

    if (isMatch) {
      console.log('\n🎯 Thông tin đăng nhập:');
      console.log('   📧 Email: admin@certificateextraction.com');
      console.log('   🔒 Password: admin123456');
      console.log('   🌐 URL: http://localhost:3000/admin');
    } else {
      console.log('\n❌ Vẫn có lỗi với password!');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.code === 11000) {
      console.log('💡 Email đã tồn tại, thử xóa và tạo lại...');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
recreateAdmin();