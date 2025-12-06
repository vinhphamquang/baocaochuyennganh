require('dotenv').config()
const mongoose = require('mongoose')

async function testComments() {
  console.log('🧪 Testing Comments System...')
  console.log('📊 MongoDB URI:', process.env.MONGODB_URI ? 'Configured ✓' : 'Missing ✗')
  console.log('---')

  try {
    // Kết nối MongoDB
    console.log('\n📡 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ MongoDB connected successfully!')

    // Import model
    const Comment = require('./models/Comment')

    // Kiểm tra số lượng comments
    console.log('\n📝 Checking comments...')
    const count = await Comment.countDocuments()
    console.log(`📊 Total comments: ${count}`)

    // Lấy danh sách comments
    const comments = await Comment.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(5)
    
    console.log(`\n✅ Found ${comments.length} approved comments:`)
    comments.forEach((comment, index) => {
      console.log(`\n${index + 1}. ${comment.userName} (${comment.rating}⭐)`)
      console.log(`   "${comment.content.substring(0, 50)}..."`)
      console.log(`   Created: ${comment.createdAt.toLocaleDateString('vi-VN')}`)
    })

    console.log('\n✨ Test completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.log('\n🔍 Troubleshooting:')
    console.log('1. Check if MongoDB URI is correct in .env')
    console.log('2. Make sure MongoDB Atlas allows your IP address')
    console.log('3. Verify network connection')
    console.log('4. Run: npm install mongoose')
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Connection closed')
  }
}

// Run test
testComments()
