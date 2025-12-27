const mongoose = require('mongoose');
const CertificateTemplate = require('./models/CertificateTemplate');
require('dotenv').config({ path: '.env' });

const sampleTemplates = [
  {
    name: 'VSTEP - Mẫu chuẩn Việt Nam',
    certificateType: 'VSTEP',
    description: 'Mẫu nhận dạng cho chứng chỉ VSTEP (Vietnamese Standardized Test)',
    patterns: {
      namePatterns: [
        {
          pattern: '(?:Full Name|Họ và tên|Name)\\s*:?\\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\\s]+)',
          description: 'Pattern nhận dạng họ tên',
          priority: 1
        }
      ],
      dobPatterns: [
        {
          pattern: '(?:Date of Birth|Ngày sinh|DOB)\\s*:?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
          description: 'Pattern nhận dạng ngày sinh',
          priority: 1
        }
      ],
      certificateNumberPatterns: [
        {
          pattern: '(?:Certificate No|Số chứng chỉ|Number)\\s*:?\\s*([A-Z0-9-]+)',
          description: 'Pattern nhận dạng số chứng chỉ',
          priority: 1
        }
      ],
      examDatePatterns: [
        {
          pattern: '(?:Test Date|Exam Date|Ngày thi)\\s*:?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
          description: 'Pattern nhận dạng ngày thi',
          priority: 1
        }
      ],
      scorePatterns: [
        {
          skill: 'listening',
          pattern: '(?:Listening|Nghe)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Listening',
          minScore: 0,
          maxScore: 10,
          priority: 1
        },
        {
          skill: 'reading',
          pattern: '(?:Reading|Đọc)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Reading',
          minScore: 0,
          maxScore: 10,
          priority: 1
        },
        {
          skill: 'writing',
          pattern: '(?:Writing|Viết)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Writing',
          minScore: 0,
          maxScore: 10,
          priority: 1
        },
        {
          skill: 'speaking',
          pattern: '(?:Speaking|Nói)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Speaking',
          minScore: 0,
          maxScore: 10,
          priority: 1
        },
        {
          skill: 'overall',
          pattern: '(?:Overall|Tổng điểm)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm tổng',
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
      totalProcessed: 22,
      successfulExtractions: 8,
      averageConfidence: 97
    },
    isActive: true,
    version: '1.0'
  },
  {
    name: 'TOEIC Listening & Reading',
    certificateType: 'TOEIC',
    description: 'Mẫu nhận dạng cho chứng chỉ TOEIC Listening & Reading',
    patterns: {
      namePatterns: [
        {
          pattern: '(?:Name|Candidate Name)\\s*:?\\s*([A-Z\\s]+)',
          description: 'Pattern nhận dạng họ tên',
          priority: 1
        }
      ],
      dobPatterns: [
        {
          pattern: '(?:Date of Birth|DOB)\\s*:?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
          description: 'Pattern nhận dạng ngày sinh',
          priority: 1
        }
      ],
      certificateNumberPatterns: [
        {
          pattern: '(?:Registration Number|Test Taker ID)\\s*:?\\s*([A-Z0-9-]+)',
          description: 'Pattern nhận dạng số chứng chỉ',
          priority: 1
        }
      ],
      examDatePatterns: [
        {
          pattern: '(?:Test Date)\\s*:?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
          description: 'Pattern nhận dạng ngày thi',
          priority: 1
        }
      ],
      scorePatterns: [
        {
          skill: 'listening',
          pattern: '(?:Listening)\\s*:?\\s*(\\d+)',
          description: 'Điểm Listening',
          minScore: 5,
          maxScore: 495,
          priority: 1
        },
        {
          skill: 'reading',
          pattern: '(?:Reading)\\s*:?\\s*(\\d+)',
          description: 'Điểm Reading',
          minScore: 5,
          maxScore: 495,
          priority: 1
        },
        {
          skill: 'total',
          pattern: '(?:Total Score)\\s*:?\\s*(\\d+)',
          description: 'Tổng điểm',
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
      totalProcessed: 29,
      successfulExtractions: 10,
      averageConfidence: 98
    },
    isActive: true,
    version: '1.0'
  },
  {
    name: 'IELTS Academic - Mẫu chuẩn',
    certificateType: 'IELTS',
    description: 'Mẫu nhận dạng cho chứng chỉ IELTS Academic phiên bản chuẩn',
    patterns: {
      namePatterns: [
        {
          pattern: '(?:Candidate Name|Family Name.*?First Name)\\s*:?\\s*([A-Z\\s]+)',
          description: 'Pattern nhận dạng họ tên',
          priority: 1
        }
      ],
      dobPatterns: [
        {
          pattern: '(?:Date of Birth)\\s*:?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
          description: 'Pattern nhận dạng ngày sinh',
          priority: 1
        }
      ],
      certificateNumberPatterns: [
        {
          pattern: '(?:Candidate Number|Test Report Form Number)\\s*:?\\s*([A-Z0-9-]+)',
          description: 'Pattern nhận dạng số chứng chỉ',
          priority: 1
        }
      ],
      examDatePatterns: [
        {
          pattern: '(?:Test Date|Exam Date)\\s*:?\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})',
          description: 'Pattern nhận dạng ngày thi',
          priority: 1
        }
      ],
      scorePatterns: [
        {
          skill: 'listening',
          pattern: '(?:Listening)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Listening',
          minScore: 0,
          maxScore: 9,
          priority: 1
        },
        {
          skill: 'reading',
          pattern: '(?:Reading)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Reading',
          minScore: 0,
          maxScore: 9,
          priority: 1
        },
        {
          skill: 'writing',
          pattern: '(?:Writing)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Writing',
          minScore: 0,
          maxScore: 9,
          priority: 1
        },
        {
          skill: 'speaking',
          pattern: '(?:Speaking)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm Speaking',
          minScore: 0,
          maxScore: 9,
          priority: 1
        },
        {
          skill: 'overall',
          pattern: '(?:Overall Band Score)\\s*:?\\s*(\\d+(?:\\.\\d+)?)',
          description: 'Điểm tổng',
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
      totalProcessed: 21,
      successfulExtractions: 7,
      averageConfidence: 97
    },
    isActive: true,
    version: '1.0'
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa tất cả templates cũ (nếu muốn reset)
    // await CertificateTemplate.deleteMany({});
    // console.log('🗑️  Cleared existing templates');

    // Kiểm tra xem đã có templates chưa
    const existingCount = await CertificateTemplate.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} existing templates. Skipping seed.`);
      console.log('   To reset, uncomment the deleteMany line in the script.');
      process.exit(0);
    }

    // Thêm templates mới
    for (const templateData of sampleTemplates) {
      const template = new CertificateTemplate(templateData);
      await template.save();
      console.log(`✅ Created template: ${template.name}`);
    }

    console.log('\n🎉 Template seeding completed successfully!');
    console.log(`   Total templates created: ${sampleTemplates.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
