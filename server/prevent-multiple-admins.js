const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

/**
 * Script để đảm bảo chỉ có 1 tài khoản admin duy nhất
 * Xóa tất cả admin khác ngoài admin chính
 */
async function ensureSingleAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm tất cả tài khoản admin
    const allAdmins = await User.find({ role: 'admin' });
    console.log(`📊 Tìm thấy ${allAdmins.length} tài khoản admin`);

    if (allAdmins.length <= 1) {
      console.log('✅ Hệ thống đã có đúng 1 tài khoản admin');
      return;
    }

    // Giữ lại admin có email chính thức
    const mainAdmin = allAdmins.find(admin => 
      admin.email === 'admin@certificateextraction.com'
    ) || allAdmins[0]; // Nếu không có admin chính thức, giữ admin đầu tiên

    console.log(`🎯 Giữ lại admin chính: ${mainAdmin.email} (${mainAdmin.fullName})`);

    // Xóa các admin khác
    const adminsToDelete = allAdmins.filter(admin => 
      admin._id.toString() !== mainAdmin._id.toString()
    );

    for (const admin of adminsToDelete) {
      await User.findByIdAndDelete(admin._id);
      console.log(`🗑️ Đã xóa admin: ${admin.email} (${admin.fullName})`);
    }

    console.log(`\n🎉 Hoàn tất! Chỉ còn 1 tài khoản admin duy nhất:`);
    console.log(`   📧 Email: ${mainAdmin.email}`);
    console.log(`   👤 Tên: ${mainAdmin.fullName}`);
    console.log(`   🆔 ID: ${mainAdmin._id}`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
ensureSingleAdmin();