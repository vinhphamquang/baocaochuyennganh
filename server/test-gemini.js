const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = 'AIzaSyDLqNx0zDJE8rAQGtst9x9wfF5AgC7ISa4';
  
  try {
    console.log('🔑 Testing Gemini API...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try with gemini-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent('Hello, can you help me extract information from certificates?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API works!');
    console.log('Response:', text);
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    
    if (error.message.includes('quota')) {
      console.log('💡 Giải pháp: API key đã hết quota. Cần tạo key mới hoặc nâng cấp billing.');
    } else if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 Giải pháp: API key không hợp lệ. Cần tạo key mới từ Google AI Studio.');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 Giải pháp: API key không có quyền truy cập. Kiểm tra billing và permissions.');
    } else {
      console.log('💡 Giải pháp: Kiểm tra kết nối internet và thử lại.');
    }
    
    return false;
  }
}

testGeminiAPI();