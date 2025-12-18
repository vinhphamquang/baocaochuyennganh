const mongoose = require('mongoose');
const CertificateTemplate = require('./models/CertificateTemplate');
const User = require('./models/User');
require('dotenv').config();

async function seedTemplates() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm admin user để làm creator
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Không tìm thấy admin user');
      return;
    }

    // Xóa templates cũ
    await CertificateTemplate.deleteMany({});
    console.log('🗑️ Đã xóa templates cũ');

    // Tạo templates mẫu
    const templates = [
      {
        name: 'IELTS Academic - Mẫu chuẩn',
        certificateType: 'IELTS',
        description: 'Mẫu nhận dạng cho chứng chỉ IELTS Academic phiên bản chuẩn',
        patterns: {
          namePatterns: [
            {
              pattern: 'Family\\s+Name\\s+([A-Z]+)\\s+First\\s+Name\\(?s?\\)?\\s+([A-Z][A-Za-z\\s]+)',
              description: 'Pattern Family Name + First Name cho IELTS',
              priority: 1
            },
            {
              pattern: 'Candidate\\s+Name[:\\s]+([A-Z][A-Za-z\\s]+)',
              description: 'Pattern Candidate Name',
              priority: 2
            }
          ],
          dobPatterns: [
            {
              pattern: 'Date\\s+of\\s+Birth[:\\s|]+(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4})',
              description: 'Pattern Date of Birth',
              priority: 1
            }
          ],
          certificateNumberPatterns: [
            {
              pattern: 'Form\\s+Number\\s+([A-Z0-9]+)',
              description: 'Pattern Form Number cho IELTS',
              priority: 1
            }
          ],
          examDatePatterns: [
            {
              pattern: 'Date[:\\s|]+(\\d{1,2}[/\\-][A-Z]{3}[/\\-]\\d{4})',
              description: 'Pattern ngày thi IELTS',
              priority: 1
            }
          ],
          scorePatterns: [
            {
              skill: 'listening',
              pattern: 'Listening[:\\s|]+[\"\\s°\\.\\-]*(\\d+)\\.?\\d*',
              description: 'Pattern điểm Listening',
              minScore: 0,
              maxScore: 9,
              priority: 1
            },
            {
              skill: 'reading',
              pattern: 'Reading[:\\s|]+[\"\\s°\\.\\-]*(\\d+)\\.?\\d*',
              description: 'Pattern điểm Reading',
              minScore: 0,
              maxScore: 9,
              priority: 1
            },
            {
              skill: 'writing',
              pattern: 'Writing[:\\s|]+[\"\\s°\\.\\-]*(\\d+)\\.?\\d*',
              description: 'Pattern điểm Writing',
              minScore: 0,
              maxScore: 9,
              priority: 1
            },
            {
              skill: 'speaking',
              pattern: 'Speaking[:\\s|]+[\"\\s°\\.\\-]*(\\d+)\\.?\\d*',
              description: 'Pattern điểm Speaking',
              minScore: 0,
              maxScore: 9,
              priority: 1
            },
            {
              skill: 'overall',
              pattern: 'Band\\s+(\\d+)\\.?\\d*',
              description: 'Pattern Overall Band Score',
              minScore: 0,
              maxScore: 9,
              priority: 1
            }
          ]
        },
        scoreConfig: {
          skills: ['listening', 'reading', 'writing', 'speaking'],
          hasOverall: true,
          hasTotal: false,
          minScore: 0,
          maxScore: 9,
          scoreType: 'decimal'
        },
        usage: {
          totalProcessed: 156,
          successfulExtractions: 142,
          averageConfidence: 87.5,
          lastUsed: new Date()
        },
        isActive: true,
        version: '1.0',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'TOEIC Listening & Reading',
        certificateType: 'TOEIC',
        description: 'Mẫu nhận dạng cho chứng chỉ TOEIC Listening & Reading',
        patterns: {
          namePatterns: [
            {
              pattern: 'Name[:\\s]+([A-Z][A-Za-z\\s]+)',
              description: 'Pattern Name cho TOEIC',
              priority: 1
            }
          ],
          dobPatterns: [
            {
              pattern: 'Date\\s+of\\s+Birth[:\\s]+(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4})',
              description: 'Pattern Date of Birth',
              priority: 1
            }
          ],
          certificateNumberPatterns: [
            {
              pattern: 'Certificate\\s+Number[:\\s]+([A-Z0-9\\-]+)',
              description: 'Pattern Certificate Number',
              priority: 1
            }
          ],
          examDatePatterns: [
            {
              pattern: 'Test\\s+Date[:\\s]+(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4})',
              description: 'Pattern Test Date',
              priority: 1
            }
          ],
          scorePatterns: [
            {
              skill: 'listening',
              pattern: 'Listening[:\\s]+(\\d{2,3})',
              description: 'Pattern điểm Listening TOEIC',
              minScore: 5,
              maxScore: 495,
              priority: 1
            },
            {
              skill: 'reading',
              pattern: 'Reading[:\\s]+(\\d{2,3})',
              description: 'Pattern điểm Reading TOEIC',
              minScore: 5,
              maxScore: 495,
              priority: 1
            },
            {
              skill: 'total',
              pattern: 'Total\\s+Score[:\\s]+(\\d{3,4})',
              description: 'Pattern Total Score TOEIC',
              minScore: 10,
              maxScore: 990,
              priority: 1
            }
          ]
        },
        scoreConfig: {
          skills: ['listening', 'reading'],
          hasOverall: false,
          hasTotal: true,
          minScore: 10,
          maxScore: 990,
          scoreType: 'integer'
        },
        usage: {
          totalProcessed: 89,
          successfulExtractions: 78,
          averageConfidence: 82.3,
          lastUsed: new Date()
        },
        isActive: true,
        version: '1.0',
        createdBy: admin._id,
        updatedBy: admin._id
      },
      {
        name: 'VSTEP - Mẫu chuẩn Việt Nam',
        certificateType: 'VSTEP',
        description: 'Mẫu nhận dạng cho chứng chỉ VSTEP (Vietnamese Standardized Test)',
        patterns: {
          namePatterns: [
            {
              pattern: 'Họ\\s+và\\s+tên[:\\s]+([A-ZÀ-Ỹ][A-Za-zÀ-ỹ\\s]+)',
              description: 'Pattern Họ và tên tiếng Việt',
              priority: 1
            },
            {
              pattern: 'Full\\s+Name[:\\s]+([A-Z][A-Za-z\\s]+)',
              description: 'Pattern Full Name',
              priority: 2
            }
          ],
          dobPatterns: [
            {
              pattern: 'Ngày\\s+sinh[:\\s]+(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4})',
              description: 'Pattern Ngày sinh tiếng Việt',
              priority: 1
            }
          ],
          certificateNumberPatterns: [
            {
              pattern: 'Số\\s+chứng\\s+chỉ[:\\s]+([A-Z0-9\\-]+)',
              description: 'Pattern Số chứng chỉ',
              priority: 1
            }
          ],
          examDatePatterns: [
            {
              pattern: 'Ngày\\s+thi[:\\s]+(\\d{1,2}[/\\-]\\d{1,2}[/\\-]\\d{4})',
              description: 'Pattern Ngày thi',
              priority: 1
            }
          ],
          scorePatterns: [
            {
              skill: 'listening',
              pattern: 'Nghe[:\\s]+(\\d+\\.?\\d*)',
              description: 'Pattern điểm Nghe',
              minScore: 0,
              maxScore: 10,
              priority: 1
            },
            {
              skill: 'reading',
              pattern: 'Đọc[:\\s]+(\\d+\\.?\\d*)',
              description: 'Pattern điểm Đọc',
              minScore: 0,
              maxScore: 10,
              priority: 1
            },
            {
              skill: 'writing',
              pattern: 'Viết[:\\s]+(\\d+\\.?\\d*)',
              description: 'Pattern điểm Viết',
              minScore: 0,
              maxScore: 10,
              priority: 1
            },
            {
              skill: 'speaking',
              pattern: 'Nói[:\\s]+(\\d+\\.?\\d*)',
              description: 'Pattern điểm Nói',
              minScore: 0,
              maxScore: 10,
              priority: 1
            },
            {
              skill: 'overall',
              pattern: 'Tổng[:\\s]+(\\d+\\.?\\d*)',
              description: 'Pattern điểm Tổng',
              minScore: 0,
              maxScore: 10,
              priority: 1
            }
          ]
        },
        scoreConfig: {
          skills: ['listening', 'reading', 'writing', 'speaking'],
          hasOverall: true,
          hasTotal: false,
          minScore: 0,
          maxScore: 10,
          scoreType: 'decimal'
        },
        usage: {
          totalProcessed: 45,
          successfulExtractions: 38,
          averageConfidence: 79.2,
          lastUsed: new Date()
        },
        isActive: true,
        version: '1.0',
        createdBy: admin._id,
        updatedBy: admin._id
      }
    ];

    // Lưu templates
    const savedTemplates = await CertificateTemplate.insertMany(templates);
    console.log(`✅ Đã tạo ${savedTemplates.length} templates mẫu`);

    savedTemplates.forEach(template => {
      console.log(`   📄 ${template.name} (${template.certificateType})`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi tạo templates:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

// Chạy script
seedTemplates();