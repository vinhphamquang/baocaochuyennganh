const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login via API...');
    
    const loginData = {
      email: 'admin@certificateextraction.com',
      password: 'admin123456'
    };
    
    console.log('📤 Sending login request...');
    console.log(`Email: ${loginData.email}`);
    console.log(`Password: ${loginData.password}`);
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`📥 Response status: ${response.status}`);
    
    const result = await response.json();
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Đăng nhập thành công!');
      console.log(`👤 User: ${result.user.fullName}`);
      console.log(`📧 Email: ${result.user.email}`);
      console.log(`🔑 Role: ${result.user.role}`);
      console.log(`🎫 Token: ${result.token.substring(0, 20)}...`);
    } else {
      console.log('\n❌ Đăng nhập thất bại!');
      console.log(`Lỗi: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.log('💡 Đảm bảo server đang chạy: npm run dev (trong thư mục server)');
  }
}

testAdminLogin();