const mongoose = require('mongoose');
const User = require('./models/User');
const Certificate = require('./models/Certificate');
const CertificateTemplate = require('./models/CertificateTemplate');
require('dotenv').config();

async function seedSampleData() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa dữ liệu cũ (trừ admin)
    console.log('🗑️ Xóa dữ liệu cũ...');
    await Certificate.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('✅ Đã xóa dữ liệu cũ');

    // Tạo một số users mẫu
    console.log('👥 Tạo users mẫu...');
    const sampleUsers = [];
    for (let i = 1; i <= 10; i++) {
      const user = new User({
        fullName: `Người dùng ${i}`,
        email: `user${i}@example.com`,
        password: 'password123',
        role: 'user',
        isActive: Math.random() > 0.2, // 80% active
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random trong 90 ngày
      });
      await user.save();
      sampleUsers.push(user);
    }
    console.log(`✅ Đã tạo ${sampleUsers.length} users`);

    // Tạo certificates mẫu
    console.log('📄 Tạo certificates mẫu...');
    const certificateTypes = ['IELTS', 'TOEIC', 'VSTEP', 'TOEFL'];
    const statuses = ['completed', 'processing', 'failed'];
    const extractionMethods = ['gemini-ai', 'tesseract-ocr', 'mock-data'];

    for (let i = 1; i <= 50; i++) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const certificateType = certificateTypes[Math.floor(Math.random() * certificateTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const certificate = new Certificate({
        userId: randomUser._id,
        fileName: `certificate_${i}.jpg`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
        fileType: 'image/jpeg',
        certificateType,
        processingStatus: status,
        confidence: status === 'completed' ? Math.floor(Math.random() * 40) + 60 : 0, // 60-100 for completed
        processingTime: status === 'completed' ? (Math.random() * 5 + 0.5).toFixed(2) : null,
        extractionMethod: extractionMethods[Math.floor(Math.random() * extractionMethods.length)],
        extractedData: status === 'completed' ? {
          fullName: `NGUYEN VAN ${String.fromCharCode(65 + (i % 26))}`,
          certificateNumber: `CERT${1000 + i}`,
          examDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          scores: certificateType === 'IELTS' ? {
            listening: (Math.random() * 3 + 6).toFixed(1),
            reading: (Math.random() * 3 + 6).toFixed(1),
            writing: (Math.random() * 3 + 6).toFixed(1),
            speaking: (Math.random() * 3 + 6).toFixed(1),
            overall: (Math.random() * 3 + 6).toFixed(1)
          } : certificateType === 'TOEIC' ? {
            listening: Math.floor(Math.random() * 200) + 300,
            reading: Math.floor(Math.random() * 200) + 300,
            total: Math.floor(Math.random() * 400) + 600
          } : {
            overall: (Math.random() * 4 + 6).toFixed(1)
          }
        } : null,
        errorMessage: status === 'failed' ? 'Image quality too low' : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random trong 30 ngày
        updatedAt: new Date()
      });
      
      await certificate.save();
    }
    console.log('✅ Đã tạo 50 certificates');

    // Cập nhật usage cho templates có sẵn
    console.log('📊 Cập nhật usage cho templates...');
    const templates = await CertificateTemplate.find();
    
    for (const template of templates) {
      // Đếm certificates theo loại
      const totalProcessed = await Certificate.countDocuments({ 
        certificateType: template.certificateType 
      });
      
      const successfulExtractions = await Certificate.countDocuments({ 
        certificateType: template.certificateType,
        processingStatus: 'completed'
      });

      // Tính confidence trung bình
      const avgConfidenceResult = await Certificate.aggregate([
        { 
          $match: { 
            certificateType: template.certificateType,
            processingStatus: 'completed',
            confidence: { $gt: 0 }
          }
        },
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
      ]);

      template.usage = {
        totalProcessed,
        successfulExtractions,
        averageConfidence: avgConfidenceResult[0]?.avgConfidence || 0,
        lastUsed: totalProcessed > 0 ? new Date() : null
      };

      await template.save();
      console.log(`✅ Cập nhật usage cho ${template.name}: ${totalProcessed} processed`);
    }

    console.log('\n🎉 Hoàn tất tạo dữ liệu mẫu!');
    console.log('📊 Thống kê:');
    console.log(`   👥 Users: ${sampleUsers.length}`);
    console.log(`   📄 Certificates: 50`);
    console.log(`   🎯 Templates: ${templates.length}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
seedSampleData();