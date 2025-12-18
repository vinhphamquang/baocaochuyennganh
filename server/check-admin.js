const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminAccount() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm tất cả tài khoản admin
    const admins = await User.find({ role: 'admin' });
    console.log(`📊 Tìm thấy ${admins.length} tài khoản admin:`);

    for (const admin of admins) {
      console.log(`\n👤 Admin #${admin._id}:`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   👤 Tên: ${admin.fullName}`);
      console.log(`   🔑 Role: ${admin.role}`);
      console.log(`   ✅ Active: ${admin.isActive}`);
      console.log(`   📅 Tạo: ${admin.createdAt}`);
      console.log(`   🔒 Password hash: ${admin.password.substring(0, 20)}...`);
      
      // Test password
      const testPassword = 'admin123456';
      const isMatch = await admin.comparePassword(testPassword);
      console.log(`   🧪 Test password '${testPassword}': ${isMatch ? '✅ ĐÚNG' : '❌ SAI'}`);
    }

    // Tìm tất cả users để so sánh
    const allUsers = await User.find({});
    console.log(`\n📊 Tổng số users trong hệ thống: ${allUsers.length}`);
    
    const usersByRole = {};
    allUsers.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });
    
    console.log('📈 Phân bố theo role:');
    Object.entries(usersByRole).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
checkAdminAccount();