require('dotenv').config()
const { sendPasswordResetRequestNotification, sendResetPasswordEmail } = require('./utils/email')

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || '❌ Not set')
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set')
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set')
  console.log('  ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Not set')
  console.log('')

  if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER) {
    console.error('❌ Email configuration is missing!')
    console.log('📖 Please read EMAIL_SETUP.md for configuration instructions')
    process.exit(1)
  }

  // Test 1: Send notification to admin
  console.log('📧 Test 1: Sending notification to admin...')
  try {
    const result1 = await sendPasswordResetRequestNotification(
      process.env.ADMIN_EMAIL || 'admin@certificateextraction.com',
      {
        fullName: 'Test User',
        email: 'testuser@example.com',
        reason: 'Testing email configuration'
      }
    )
    
    if (result1.success) {
      console.log('✅ Admin notification sent successfully!')
      console.log('   Message ID:', result1.messageId)
    } else {
      console.error('❌ Failed to send admin notification')
      console.error('   Error:', result1.error)
    }
  } catch (error) {
    console.error('❌ Error sending admin notification:', error.message)
  }
  
  console.log('')

  // Test 2: Send reset password email
  console.log('📧 Test 2: Sending reset password email...')
  try {
    const testResetLink = 'http://localhost:3000/reset-password?token=test-token-123'
    const result2 = await sendResetPasswordEmail(
      process.env.EMAIL_USER, // Send to yourself for testing
      testResetLink,
      'Test User'
    )
    
    if (result2.success) {
      console.log('✅ Reset password email sent successfully!')
      console.log('   Message ID:', result2.messageId)
    } else {
      console.error('❌ Failed to send reset password email')
      console.error('   Error:', result2.error)
    }
  } catch (error) {
    console.error('❌ Error sending reset password email:', error.message)
  }

  console.log('')
  console.log('🎉 Email test completed!')
  console.log('📬 Please check your inbox and spam folder')
}

testEmail()
