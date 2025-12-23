const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/certificate-extraction', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  certificatesProcessed: {
    type: Number,
    default: 0
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Create test user
    const testUser = new User({
      fullName: 'Test User',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: user@test.com');
    console.log('Password: password123');

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin@certificateextraction.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        fullName: 'Admin User',
        email: 'admin@certificateextraction.com',
        password: 'admin123456',
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@certificateextraction.com');
      console.log('Password: admin123456');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️ Test user already exists');
    } else {
      console.error('❌ Error creating test user:', error);
    }
    process.exit(1);
  }
}

createTestUser();