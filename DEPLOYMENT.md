# 🚀 Hướng dẫn Deploy

## Tổng quan

Dự án được chia thành 2 phần độc lập:
- **Frontend**: Next.js application
- **Backend**: Express.js API

Có thể deploy riêng biệt hoặc cùng nhau.

## 📦 Deploy Frontend (Next.js)

### Option 1: Vercel (Khuyến nghị)

1. **Chuẩn bị**
```bash
cd frontend
npm run build
```

2. **Deploy lên Vercel**
```bash
npm install -g vercel
vercel
```

3. **Cấu hình Environment Variables trên Vercel**
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### Option 2: Netlify

1. **Build**
```bash
cd frontend
npm run build
```

2. **Deploy**
- Kết nối GitHub repo với Netlify
- Build command: `npm run build`
- Publish directory: `.next`

### Option 3: Docker

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t certificate-frontend .
docker run -p 3000:3000 certificate-frontend
```

## 🔧 Deploy Backend (Express.js)

### Option 1: Railway

1. **Chuẩn bị**
- Tạo tài khoản Railway
- Kết nối GitHub repo

2. **Cấu hình**
- Root directory: `backend`
- Start command: `npm start`

3. **Environment Variables**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
FRONTEND_URL=https://your-frontend.vercel.app
```

### Option 2: Heroku

1. **Chuẩn bị**
```bash
cd backend
heroku create your-app-name
```

2. **Deploy**
```bash
git subtree push --prefix backend heroku main
```

3. **Cấu hình MongoDB Atlas**
- Tạo cluster trên MongoDB Atlas
- Whitelist Heroku IP
- Copy connection string

### Option 3: VPS (Ubuntu)

1. **Cài đặt Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Cài đặt MongoDB**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

3. **Deploy Backend**
```bash
cd /var/www
git clone your-repo
cd your-repo/backend
npm install
```

4. **Cấu hình PM2**
```bash
npm install -g pm2
pm2 start server.js --name certificate-backend
pm2 startup
pm2 save
```

5. **Cấu hình Nginx**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Docker

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
docker build -t certificate-backend .
docker run -p 5000:5000 --env-file .env certificate-backend
```

## 🐳 Deploy với Docker Compose

Tạo file `docker-compose.yml` ở root:

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/certificate-extraction
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Chạy:
```bash
docker-compose up -d
```

## 🌐 Cấu hình Domain

### Frontend
```
yourdomain.com -> Vercel/Netlify
```

### Backend
```
api.yourdomain.com -> Railway/Heroku/VPS
```

### Cập nhật CORS
```javascript
// backend/server.js
const corsOptions = {
  origin: ['https://yourdomain.com', 'http://localhost:3000'],
  credentials: true
};
```

## 📊 Monitoring & Logging

### Frontend
- Vercel Analytics
- Google Analytics
- Sentry (error tracking)

### Backend
- PM2 monitoring
- MongoDB Atlas monitoring
- Winston logger
- Sentry (error tracking)

## 🔒 Security Checklist

- [ ] Đổi JWT_SECRET thành giá trị mạnh
- [ ] Cấu hình CORS đúng domain
- [ ] Enable HTTPS (SSL certificate)
- [ ] Whitelist MongoDB IP
- [ ] Rate limiting enabled
- [ ] Environment variables secured
- [ ] Remove console.logs trong production
- [ ] Enable Helmet security headers
- [ ] Backup database định kỳ

## 🧪 Testing trước khi Deploy

### Frontend
```bash
cd frontend
npm run build
npm start
# Test tại http://localhost:3000
```

### Backend
```bash
cd backend
NODE_ENV=production npm start
# Test API tại http://localhost:5000
```

## 📝 Checklist Deploy

- [ ] Build frontend thành công
- [ ] Build backend thành công
- [ ] Database connection hoạt động
- [ ] Environment variables đã cấu hình
- [ ] CORS đã cấu hình đúng
- [ ] API endpoints hoạt động
- [ ] Authentication hoạt động
- [ ] File upload hoạt động
- [ ] Email service hoạt động
- [ ] OCR + AI hoạt động
- [ ] Admin dashboard accessible
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Monitoring setup
- [ ] Backup strategy in place

## 🆘 Troubleshooting

### Frontend không kết nối được Backend
- Kiểm tra `NEXT_PUBLIC_API_URL`
- Kiểm tra CORS configuration
- Kiểm tra network tab trong browser

### Backend không kết nối được Database
- Kiểm tra `MONGODB_URI`
- Kiểm tra IP whitelist
- Kiểm tra MongoDB service status

### OCR không hoạt động
- Kiểm tra Tesseract.js installation
- Kiểm tra file size limits
- Kiểm tra memory limits

### AI không hoạt động
- Kiểm tra `GEMINI_API_KEY`
- Kiểm tra API quota
- Kiểm tra network connectivity

## 📞 Support

Nếu gặp vấn đề khi deploy, vui lòng:
1. Kiểm tra logs
2. Xem documentation
3. Liên hệ support team
