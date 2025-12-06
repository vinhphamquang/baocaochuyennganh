const nodemailer = require('nodemailer')

// Cấu hình email transporter
const createTransporter = () => {
  // Option 1: Sử dụng Gmail
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App Password, không phải mật khẩu thường
      }
    })
  }
  
  // Option 2: Sử dụng SendGrid
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransporter({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    })
  }
  
  // Option 3: Sử dụng SMTP tùy chỉnh
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })
}

// Gửi email reset password
const sendResetPasswordEmail = async (email, resetLink, userName) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'CertExtract'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Đặt lại mật khẩu - CertExtract',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 30px; color: white; }
            .content { background: white; border-radius: 8px; padding: 30px; margin-top: 20px; color: #333; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0; font-size: 28px;">🔒 Đặt lại mật khẩu</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">CertExtract</p>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${userName || 'bạn'}</strong>,</p>
            
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Đặt lại mật khẩu</a>
            </div>
            
            <p>Hoặc copy link sau:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Lưu ý:</strong> Link này chỉ có hiệu lực trong <strong>1 giờ</strong>
            </div>
            
            <p>Trân trọng,<br><strong>Đội ngũ CertExtract</strong></p>
          </div>
        </body>
        </html>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// Gửi email chào mừng
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'CertExtract'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Chào mừng đến với CertExtract! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: white; padding: 30px; margin-top: 20px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
            .feature { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">🎉 Chào mừng đến với CertExtract!</h1>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${userName}</strong>,</p>
            
            <p>Cảm ơn bạn đã đăng ký tài khoản tại CertExtract!</p>
            
            <h3>🚀 Bắt đầu ngay:</h3>
            
            <div class="feature">
              <strong>📤 Tải lên chứng chỉ</strong><br>
              Upload file chứng chỉ của bạn
            </div>
            
            <div class="feature">
              <strong>🤖 Trích xuất tự động</strong><br>
              AI sẽ tự động đọc và trích xuất thông tin
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/extract" class="button">Bắt đầu trích xuất</a>
            </div>
            
            <p>Trân trọng,<br><strong>Đội ngũ CertExtract</strong></p>
          </div>
        </body>
        </html>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Welcome email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendResetPasswordEmail,
  sendWelcomeEmail
}
