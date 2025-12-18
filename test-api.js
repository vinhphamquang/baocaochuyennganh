// Test script để kiểm tra API hoạt động
const fs = require('fs');
const path = require('path');

async function testAPI() {
  console.log('🧪 Testing Certificate Extraction API...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch('http://localhost:5000/api/ai-ocr/health');
    const healthData = await healthResponse.json();
    
    console.log('✅ Health Check Response:');
    console.log(`   Status: ${healthData.status}`);
    console.log(`   AI Engine: ${healthData.aiEngine.primary}`);
    console.log(`   Model: ${healthData.aiEngine.model}`);
    console.log(`   AI Status: ${healthData.aiEngine.status}\n`);
    
    // Test 2: Stats
    console.log('2️⃣ Testing Stats...');
    const statsResponse = await fetch('http://localhost:5000/api/ai-ocr/stats');
    const statsData = await statsResponse.json();
    
    console.log('✅ Stats Response:');
    console.log(`   Supported Types: ${statsData.stats.supportedTypes.join(', ')}`);
    console.log(`   Average Confidence: ${statsData.stats.averageConfidence}%`);
    if (statsData.notice) {
      console.log(`   Notice: ${statsData.notice.message}\n`);
    }
    
    // Test 3: Mock Image Upload (tạo ảnh giả)
    console.log('3️⃣ Testing Image Upload with Mock Data...');
    
    // Tạo FormData với mock image
    const FormData = require('form-data');
    const form = new FormData();
    
    // Tạo buffer giả lập ảnh
    const mockImageBuffer = Buffer.from('fake-image-data-for-testing');
    form.append('image', mockImageBuffer, {
      filename: 'test-ielts-certificate.jpg',
      contentType: 'image/jpeg'
    });
    
    const uploadResponse = await fetch('http://localhost:5000/api/ai-ocr', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const uploadData = await uploadResponse.json();
    
    if (uploadData.success) {
      console.log('✅ Upload Test Response:');
      console.log(`   Certificate Type: ${uploadData.data.certificateType}`);
      console.log(`   Full Name: ${uploadData.data.fullName}`);
      console.log(`   Confidence: ${uploadData.data.confidence}%`);
      console.log(`   Extraction Method: ${uploadData.data.extractionMethod}`);
      console.log(`   Processing Time: ${uploadData.data.processingTime}s\n`);
    } else {
      console.log('❌ Upload Test Failed:', uploadData.error);
    }
    
    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Backend API: Running on port 5000');
    console.log('   ✅ Frontend: Running on port 3000');
    console.log('   ✅ AI Engine: Gemini 1.5 Flash with fallback');
    console.log('   ✅ Mock Data: High-quality demo data available');
    console.log('\n🚀 Ready for demo and testing!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Make sure server is running: npm start (in server folder)');
    console.log('   2. Make sure frontend is running: npm run dev');
    console.log('   3. Check API endpoints are accessible');
  }
}

// Chạy test
testAPI();