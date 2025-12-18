const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    console.log('🧪 Testing bcrypt...');
    
    const password = 'admin123456';
    console.log(`Original password: ${password}`);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    console.log(`Salt: ${salt}`);
    
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`Hashed password: ${hashedPassword}`);
    
    // Compare password
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log(`Password match: ${isMatch ? '✅ ĐÚNG' : '❌ SAI'}`);
    
    // Test wrong password
    const wrongMatch = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log(`Wrong password match: ${wrongMatch ? '✅ ĐÚNG' : '❌ SAI'}`);
    
  } catch (error) {
    console.error('❌ Bcrypt error:', error);
  }
}

testBcrypt();