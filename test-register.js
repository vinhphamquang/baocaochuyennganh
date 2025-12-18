// Test script để debug chức năng đăng ký
async function testRegister() {
  console.log('🧪 Testing Register Function...\n');
  
  try {
    // Test 1: Register với email mới
    console.log('1️⃣ Testing register with new email...');
    const randomEmail = `test${Date.now()}@example.com`;
    
    const registerData = {
      fullName: 'Test User',
      email: randomEmail,
      password: '123456'
    };
    
    console.log('📤 Sending register request:', registerData);
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });
    
    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', result);
    
    if (response.ok) {
      console.log('✅ Register successful!');
      console.log('   Token:', result.token ? 'Generated' : 'Missing');
      console.log('   User ID:', result.user?.id);
      console.log('   User Role:', result.user?.role);
    } else {
      console.log('❌ Register failed:', result.message);
    }
    
    // Test 2: Register với email đã tồn tại
    console.log('\n2️⃣ Testing register with existing email...');
    
    const duplicateResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData), // Same email
    });
    
    const duplicateResult = await duplicateResponse.json();
    
    console.log('📥 Duplicate response status:', duplicateResponse.status);
    console.log('📥 Duplicate response:', duplicateResult);
    
    if (duplicateResponse.status === 400) {
      console.log('✅ Duplicate email validation working!');
    } else {
      console.log('❌ Duplicate email validation failed');
    }
    
    // Test 3: Register với dữ liệu không hợp lệ
    console.log('\n3️⃣ Testing register with invalid data...');
    
    const invalidData = {
      fullName: '',
      email: 'invalid-email',
      password: '123' // Too short
    };
    
    const invalidResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData),
    });
    
    const invalidResult = await invalidResponse.json();
    
    console.log('📥 Invalid data response status:', invalidResponse.status);
    console.log('📥 Invalid data response:', invalidResult);
    
    // Test 4: Kiểm tra user đã được tạo trong database
    console.log('\n4️⃣ Testing login with registered user...');
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: randomEmail,
        password: '123456'
      }),
    });
    
    const loginResult = await loginResponse.json();
    
    console.log('📥 Login response status:', loginResponse.status);
    console.log('📥 Login response:', loginResult);
    
    if (loginResponse.ok) {
      console.log('✅ User successfully created and can login!');
    } else {
      console.log('❌ User creation or login failed');
    }
    
    console.log('\n🎉 Register function tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Make sure server is running on port 5000');
    console.log('   2. Check MongoDB connection');
    console.log('   3. Verify CORS settings');
    console.log('   4. Check network connectivity');
  }
}

// Chạy test
testRegister();