const nodemailer = require('nodemailer');

console.log('nodemailer:', nodemailer);
console.log('createTransporter:', nodemailer.createTransporter);
console.log('Type:', typeof nodemailer.createTransporter);

if (typeof nodemailer.createTransporter === 'function') {
  console.log('✅ nodemailer.createTransporter is a function');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'test@gmail.com',
      pass: 'test'
    }
  });
  
  console.log('✅ Transporter created:', transporter);
} else {
  console.log('❌ nodemailer.createTransporter is NOT a function');
}
