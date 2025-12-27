# 💻 Hướng dẫn Phát triển

## 🏗️ Cấu trúc dự án

```
certificate-extraction-system/
├── frontend/                 # Next.js Frontend
│   ├── app/                 # App Router pages & components
│   ├── lib/                 # Utilities & helpers
│   └── package.json
│
└── backend/                 # Express.js Backend
    ├── routes/              # API routes
    ├── models/              # Database models
    ├── middleware/          # Express middleware
    ├── services/            # Business logic
    ├── utils/               # Utilities
    └── package.json
```

## 🚀 Setup môi trường Development

### 1. Clone repository
```bash
git clone https://github.com/your-repo/certificate-extraction-system.git
cd certificate-extraction-system
```

### 2. Cài đặt Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Chỉnh sửa .env.local
npm run dev
```

### 3. Cài đặt Backend
```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa .env
npm run dev
```

### 4. Cài đặt MongoDB
```bash
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Windows
# Download từ https://www.mongodb.com/try/download/community
```

## 🔧 Cấu hình Development

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate-extraction
JWT_SECRET=dev_secret_key_change_in_production
GEMINI_API_KEY=your_gemini_api_key

# Email (optional for development)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@certificateextraction.com

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 📝 Coding Standards

### TypeScript/JavaScript
- Sử dụng ES6+ syntax
- Async/await thay vì callbacks
- Destructuring khi có thể
- Arrow functions cho callbacks
- Meaningful variable names

### React Components
```typescript
// ✅ Good
const UserProfile = ({ user }: { user: User }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};

// ❌ Bad
function comp(props) {
  var x = props.data;
  return <div>{x}</div>;
}
```

### API Routes
```javascript
// ✅ Good
router.post('/certificates', auth, async (req, res) => {
  try {
    const certificate = await Certificate.create(req.body);
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ❌ Bad
router.post('/certificates', (req, res) => {
  Certificate.create(req.body, (err, cert) => {
    if (err) res.send(err);
    res.send(cert);
  });
});
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 🔍 Debugging

### Frontend
1. Sử dụng React DevTools
2. Console.log trong development
3. Network tab để debug API calls
4. Next.js error overlay

### Backend
1. Sử dụng `console.log` hoặc `debug` package
2. Postman/Insomnia để test API
3. MongoDB Compass để xem database
4. Node.js debugger

```javascript
// Thêm debugger statement
debugger;

// Hoặc chạy với inspect
node --inspect server.js
```

## 📦 Thêm Dependencies

### Frontend
```bash
cd frontend
npm install package-name
npm install -D dev-package-name
```

### Backend
```bash
cd backend
npm install package-name
npm install -D dev-package-name
```

## 🌿 Git Workflow

### Branch naming
```
feature/add-user-authentication
bugfix/fix-ocr-error
hotfix/security-patch
refactor/improve-api-structure
```

### Commit messages
```
feat: Add user authentication
fix: Fix OCR extraction error
docs: Update README
style: Format code
refactor: Improve API structure
test: Add unit tests
chore: Update dependencies
```

### Pull Request
1. Tạo branch từ `main`
2. Implement feature/fix
3. Write tests
4. Update documentation
5. Create PR với description rõ ràng
6. Request review
7. Merge sau khi approved

## 🔄 Database Migrations

### Tạo migration
```bash
cd backend
node scripts/create-migration.js migration-name
```

### Chạy migrations
```bash
npm run migrate
```

### Rollback
```bash
npm run migrate:rollback
```

## 📊 Monitoring Development

### Frontend
- Next.js build analyzer
- Lighthouse performance
- React DevTools Profiler

### Backend
- MongoDB slow query log
- API response time
- Memory usage

## 🐛 Common Issues

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5000
npx kill-port 5000
```

### MongoDB connection error
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb
```

### Node modules issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Rebuild TypeScript
npm run build
```

## 📚 Resources

### Frontend
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Backend
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Mongoose Docs](https://mongoosejs.com/docs)
- [JWT.io](https://jwt.io)

### Tools
- [Postman](https://www.postman.com)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Write tests
5. Update docs
6. Submit PR

## 📞 Support

- GitHub Issues: [Link]
- Discord: [Link]
- Email: dev@certificateextraction.com
