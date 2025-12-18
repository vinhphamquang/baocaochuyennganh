#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 KIỂM TRA TRẠNG THÁI HỆ THỐNG\n');

// 1. Kiểm tra cấu trúc file
console.log('1️⃣ Kiểm tra cấu trúc dự án...');

const requiredFiles = [
  'package.json',
  'app/admin/page.tsx',
  'server/package.json',
  'server/models/User.js',
  'server/routes/auth.js',
  'server/routes/admin.js',
  'server/.env',
  'ADMIN_SYSTEM.md',
  'ADMIN_LOGIN_GUIDE.md'
];

const missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - THIẾU`);
    missingFiles.push(file);
  }
});

// 2. Kiểm tra admin scripts
console.log('\n2️⃣ Kiểm tra admin scripts...');

const adminScripts = [
  'server/create-admin.js',
  'server/update-admin.js', 
  'server/recreate-admin.js',
  'server/check-admin.js',
  'server/prevent-multiple-admins.js',
  'server/fix-admin-password.js'
];

adminScripts.forEach(script => {
  if (fs.existsSync(script)) {
    console.log(`   ✅ ${script}`);
  } else {
    console.log(`   ❌ ${script} - THIẾU`);
  }
});

// 3. Kiểm tra cấu hình bảo mật
console.log('\n3️⃣ Kiểm tra cấu hình bảo mật...');

// Kiểm tra xem có trang admin/register không (phải bị xóa)
if (!fs.existsSync('app/admin/register')) {
  console.log('   ✅ Trang đăng ký admin đã bị xóa');
} else {
  console.log('   ❌ Trang đăng ký admin vẫn tồn tại - CẦN XÓA');
}

// Kiểm tra auth.js có chặn đăng ký admin không
if (fs.existsSync('server/routes/auth.js')) {
  const authContent = fs.readFileSync('server/routes/auth.js', 'utf8');
  if (authContent.includes('Không được phép đăng ký tài khoản admin')) {
    console.log('   ✅ API đã chặn đăng ký admin');
  } else {
    console.log('   ❌ API chưa chặn đăng ký admin - CẦN SỬA');
  }
}

// 4. Kiểm tra dependencies
console.log('\n4️⃣ Kiểm tra dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const serverPackageJson = JSON.parse(fs.readFileSync('server/package.json', 'utf8'));
  
  console.log('   ✅ Frontend package.json hợp lệ');
  console.log('   ✅ Backend package.json hợp lệ');
  
  // Kiểm tra một số dependencies quan trọng
  const requiredDeps = ['bcryptjs', 'jsonwebtoken', 'mongoose'];
  requiredDeps.forEach(dep => {
    if (serverPackageJson.dependencies && serverPackageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep} đã được cài đặt`);
    } else {
      console.log(`   ❌ ${dep} chưa được cài đặt`);
    }
  });
  
} catch (error) {
  console.log('   ❌ Lỗi đọc package.json');
}

// 5. Tổng kết
console.log('\n📋 TỔNG KẾT:');

if (missingFiles.length === 0) {
  console.log('   🎉 Tất cả file cần thiết đều có mặt');
} else {
  console.log(`   ⚠️ Thiếu ${missingFiles.length} file quan trọng`);
}

console.log('\n🚀 HƯỚNG DẪN TIẾP THEO:');
console.log('   1. Khởi động backend: cd server && npm run dev');
console.log('   2. Khởi động frontend: npm run dev');
console.log('   3. Tạo admin: cd server && node recreate-admin.js');
console.log('   4. Truy cập: http://localhost:3000/admin');
console.log('   5. Đăng nhập: admin@certificateextraction.com / admin123456');

console.log('\n📖 TÀI LIỆU:');
console.log('   - ADMIN_SYSTEM.md: Tổng quan hệ thống admin');
console.log('   - ADMIN_LOGIN_GUIDE.md: Hướng dẫn đăng nhập chi tiết');
console.log('   - README.md: Hướng dẫn tổng thể dự án');

console.log('\n✅ KIỂM TRA HOÀN TẤT!');