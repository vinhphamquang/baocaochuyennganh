// Test file để kiểm tra routes
console.log('Testing routes import...');

try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const Certificate = require('./models/Certificate');
  console.log('✅ Certificate model loaded');
  
  const User = require('./models/User');
  console.log('✅ User model loaded');
  
  const CertificateTemplate = require('./models/CertificateTemplate');
  console.log('✅ CertificateTemplate model loaded');
  
  const SystemLog = require('./models/SystemLog');
  console.log('✅ SystemLog model loaded');
  
  const { adminAuth } = require('./middleware/auth');
  console.log('✅ adminAuth middleware loaded');
  
  const templateRoutes = require('./routes/templates');
  console.log('✅ Template routes loaded');
  
  const reportRoutes = require('./routes/reports');
  console.log('✅ Report routes loaded');
  
  console.log('🎉 All imports successful!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}