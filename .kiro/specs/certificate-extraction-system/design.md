# Design Document

## Overview

Hệ thống trích xuất thông tin chứng chỉ ngoại ngữ được thiết kế theo kiến trúc client-server với frontend Next.js, backend Node.js/Express, và database MongoDB Atlas. Hệ thống tích hợp OCR service để trích xuất thông tin tự động từ chứng chỉ.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Client        │
│   (Next.js)     │
│   Port 3000     │
└────────┬────────┘
         │ HTTPS
         │ REST API
┌────────▼────────┐
│   Backend       │
│   (Express.js)  │
│   Port 5000     │
└────┬───────┬────┘
     │       │
     │       └──────────┐
     │                  │
┌────▼────────┐  ┌─────▼──────┐
│  MongoDB    │  │ OCR Service│
│  Atlas      │  │ (External) │
└─────────────┘  └────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- React Hook Form (form handling)
- js-cookie (cookie management)
- React Hot Toast (notifications)
- Heroicons (icons)

**Backend:**
- Node.js 18+
- Express.js (web framework)
- MongoDB + Mongoose (database)
- JWT (authentication)
- Bcrypt (password hashing)
- Multer (file upload)
- Helmet (security)
- CORS (cross-origin)

**Infrastructure:**
- MongoDB Atlas (cloud database)
- Vercel/Railway (deployment options)

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**AuthModal.tsx**
```typescript
interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
  onSuccess: () => void
}

Features:
- Login/Register forms
- Password visibility toggle
- Form validation
- API integration
- Cookie management
```

**ProtectedRoute.tsx**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin'
}

Features:
- Check authentication status
- Verify user role
- Redirect to login if unauthorized
```

#### 2. Certificate Components

**CertificateUpload.tsx**
```typescript
interface CertificateUploadProps {
  onUploadSuccess: (certificateId: string) => void
}

Features:
- Drag-and-drop upload
- File validation (type, size)
- Upload progress indicator
- Preview uploaded file
```

**CertificateList.tsx**
```typescript
interface CertificateListProps {
  certificates: Certificate[]
  onSelect: (id: string) => void
}

Features:
- Display certificate history
- Filter by type, date, status
- Pagination
- Sort options
```

**CertificateDetail.tsx**
```typescript
interface CertificateDetailProps {
  certificateId: string
}

Features:
- Display extracted data
- Edit extracted fields
- Show original image
- Export options
- Confidence score display
```

#### 3. Dashboard Components

**UserDashboard.tsx**
```typescript
Features:
- Statistics cards (total, success rate, this month)
- Recent certificates
- Quick upload
- Profile management
```

**AdminDashboard.tsx**
```typescript
Features:
- System overview
- User management table
- Certificate statistics
- System health monitoring
- Activity logs
```

#### 4. Admin Components

**UserManagement.tsx**
```typescript
Features:
- User list with search/filter
- Activate/Deactivate users
- Delete users
- View user details
- User statistics
```

**TemplateManagement.tsx**
```typescript
Features:
- Certificate template list
- Add/Edit/Delete templates
- Field mapping configuration
- Template preview
```

**SystemMonitoring.tsx**
```typescript
Features:
- Real-time system metrics
- Error logs
- API response times
- Database status
- OCR service status
```

**StatisticsReport.tsx**
```typescript
Features:
- Date range selector
- Charts (line, bar, pie)
- Export report (PDF, Excel)
- Certificate breakdown
- Performance metrics
```

### Backend Components

#### 1. Models

**User Model**
```javascript
{
  fullName: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  certificatesProcessed: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}

Methods:
- comparePassword(candidatePassword): Promise<boolean>
```

**Certificate Model**
```javascript
{
  userId: ObjectId (ref: 'User', required),
  fileName: String (required),
  fileSize: Number (required),
  fileType: String (required),
  filePath: String,
  certificateType: String (enum: ['IELTS', 'TOEFL', 'TOEIC', 'HSK', 'JLPT', 'OTHER']),
  processingStatus: String (enum: ['pending', 'processing', 'completed', 'failed']),
  extractedData: {
    fullName: String,
    dateOfBirth: String,
    certificateNumber: String,
    testDate: String,
    issueDate: String,
    issuingOrganization: String,
    scores: {
      overall: String,
      listening: String,
      reading: String,
      writing: String,
      speaking: String
    }
  },
  ocrConfidence: Number (0-100),
  processingTime: Number (milliseconds),
  errorMessage: String,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { userId: 1, createdAt: -1 }
- { processingStatus: 1 }
- { certificateType: 1 }
```

**Template Model**
```javascript
{
  name: String (required, unique),
  certificateType: String (required),
  description: String,
  fieldMappings: [{
    fieldName: String,
    ocrPattern: String,
    validationRule: String,
    required: Boolean
  }],
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

**SystemLog Model**
```javascript
{
  level: String (enum: ['info', 'warning', 'error']),
  message: String (required),
  userId: ObjectId (ref: 'User'),
  action: String,
  metadata: Object,
  timestamp: Date (default: Date.now)
}

Indexes:
- { timestamp: -1 }
- { level: 1, timestamp: -1 }
```

#### 2. Routes

**Authentication Routes (/api/auth)**
```
POST   /register          - Register new user
POST   /login             - Login user
GET    /me                - Get current user
POST   /logout            - Logout user
POST   /refresh-token     - Refresh JWT token
POST   /forgot-password   - Request password reset
POST   /reset-password    - Reset password
```

**Certificate Routes (/api/certificates)**
```
POST   /upload            - Upload certificate
GET    /                  - Get user's certificates
GET    /:id               - Get certificate by ID
PUT    /:id               - Update certificate data
DELETE /:id               - Delete certificate
GET    /:id/export        - Export certificate data
POST   /:id/reprocess     - Reprocess certificate
```

**Admin Routes (/api/admin)**
```
GET    /users             - Get all users
GET    /users/:id         - Get user by ID
PUT    /users/:id/status  - Update user status
DELETE /users/:id         - Delete user
GET    /certificates      - Get all certificates
GET    /statistics        - Get system statistics
GET    /logs              - Get system logs
POST   /templates         - Create template
GET    /templates         - Get all templates
PUT    /templates/:id     - Update template
DELETE /templates/:id     - Delete template
GET    /system-health     - Get system health
```

#### 3. Middleware

**auth.js**
```javascript
Purpose: Verify JWT token and attach user to request
Usage: Protect routes requiring authentication
```

**adminAuth.js**
```javascript
Purpose: Verify user has admin role
Usage: Protect admin-only routes
```

**upload.js**
```javascript
Purpose: Handle file upload with validation
Configuration:
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, application/pdf
- Storage: Memory storage for processing
```

**errorHandler.js**
```javascript
Purpose: Centralized error handling
Features:
- Log errors
- Format error responses
- Hide sensitive information in production
```

**rateLimiter.js**
```javascript
Purpose: Prevent abuse
Configuration:
- Window: 15 minutes
- Max requests: 100 per IP
```

#### 4. Services

**OCRService.js**
```javascript
Purpose: Interface with OCR provider
Methods:
- processImage(filePath): Promise<ExtractedData>
- detectCertificateType(image): Promise<string>
- extractFields(image, template): Promise<object>

Implementation:
- Use Tesseract.js for local OCR
- Or integrate with cloud OCR (Google Vision, AWS Textract)
```

**EmailService.js**
```javascript
Purpose: Send email notifications
Methods:
- sendWelcomeEmail(user)
- sendPasswordResetEmail(user, token)
- sendProcessingCompleteEmail(user, certificate)
```

**ExportService.js**
```javascript
Purpose: Export data to various formats
Methods:
- exportToJSON(data): string
- exportToCSV(data): string
- exportToExcel(data): Buffer
- exportToPDF(data): Buffer
```

**StatisticsService.js**
```javascript
Purpose: Calculate system statistics
Methods:
- getUserStatistics(userId): Promise<object>
- getSystemStatistics(dateRange): Promise<object>
- getCertificateBreakdown(): Promise<object>
```

## Data Models

### User Data Flow

```
Registration:
1. User submits form → Frontend validation
2. POST /api/auth/register → Backend validation
3. Hash password with bcrypt
4. Create user in MongoDB
5. Generate JWT token
6. Return token + user data
7. Store token in cookie
8. Redirect to dashboard

Login:
1. User submits credentials
2. POST /api/auth/login
3. Find user by email
4. Compare password with bcrypt
5. Generate JWT token
6. Return token + user data
7. Store token in cookie
8. Redirect to dashboard
```

### Certificate Processing Flow

```
Upload & Process:
1. User selects file → Frontend validation
2. POST /api/certificates/upload with FormData
3. Multer middleware validates and stores file
4. Create Certificate record (status: 'pending')
5. Return certificateId immediately
6. Background: Update status to 'processing'
7. Background: Call OCRService.processImage()
8. Background: Extract fields based on template
9. Background: Calculate confidence scores
10. Background: Update Certificate with extracted data
11. Background: Update status to 'completed'
12. Frontend: Poll for status updates
13. Frontend: Display extracted data when complete
```

### Admin User Management Flow

```
Deactivate User:
1. Admin clicks deactivate button
2. PUT /api/admin/users/:id/status { isActive: false }
3. Update user.isActive = false
4. Invalidate all user's active tokens
5. Return updated user
6. Frontend: Update UI

Delete User:
1. Admin clicks delete button
2. Confirmation dialog
3. DELETE /api/admin/users/:id
4. Delete all user's certificates
5. Delete user record
6. Return success
7. Frontend: Remove from list
```

## Error Handling

### Error Types

**Validation Errors (400)**
```javascript
{
  status: 400,
  message: "Validation failed",
  errors: [
    { field: "email", message: "Email is required" },
    { field: "password", message: "Password must be at least 6 characters" }
  ]
}
```

**Authentication Errors (401)**
```javascript
{
  status: 401,
  message: "Unauthorized",
  error: "Invalid token" | "Token expired" | "No token provided"
}
```

**Authorization Errors (403)**
```javascript
{
  status: 403,
  message: "Forbidden",
  error: "Insufficient permissions"
}
```

**Not Found Errors (404)**
```javascript
{
  status: 404,
  message: "Resource not found",
  error: "Certificate not found"
}
```

**Server Errors (500)**
```javascript
{
  status: 500,
  message: "Internal server error",
  error: process.env.NODE_ENV === 'development' ? errorDetails : undefined
}
```

### Error Handling Strategy

1. **Frontend**: Display user-friendly error messages using toast notifications
2. **Backend**: Log all errors with stack traces
3. **Database**: Handle connection errors with retry logic
4. **OCR Service**: Implement fallback mechanisms
5. **File Upload**: Validate before processing

## Testing Strategy

### Unit Tests

**Backend:**
- Models: Test schema validation, methods
- Services: Test business logic
- Middleware: Test authentication, authorization
- Utils: Test helper functions

**Frontend:**
- Components: Test rendering, user interactions
- Hooks: Test custom hooks
- Utils: Test helper functions

### Integration Tests

- API endpoints: Test request/response
- Database operations: Test CRUD operations
- Authentication flow: Test login/register
- File upload: Test upload and processing

### End-to-End Tests

- User registration and login
- Certificate upload and extraction
- Admin user management
- Export functionality

### Performance Tests

- Load testing: 100 concurrent users
- Stress testing: Maximum capacity
- OCR processing time: < 30 seconds
- API response time: < 2 seconds

## Security Considerations

### Authentication & Authorization

1. **JWT Tokens**: 
   - Signed with secret key
   - Expiry: 7 days
   - Stored in httpOnly cookies

2. **Password Security**:
   - Bcrypt hashing with salt rounds: 10
   - Minimum length: 6 characters
   - No password in API responses

3. **Role-Based Access Control**:
   - User role: Access own data only
   - Admin role: Access all data

### Data Protection

1. **Encryption**:
   - HTTPS for all communications
   - Sensitive data encrypted at rest

2. **File Security**:
   - Validate file types
   - Scan for malware
   - Auto-delete after 30 days

3. **Rate Limiting**:
   - 100 requests per 15 minutes per IP
   - Prevent brute force attacks

### CORS Configuration

```javascript
{
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Deployment Architecture

### Development Environment

```
Frontend: http://localhost:3000
Backend: http://localhost:5000
Database: MongoDB Atlas (development cluster)
```

### Production Environment

```
Frontend: Vercel (https://app.yourdomain.com)
Backend: Railway/Heroku (https://api.yourdomain.com)
Database: MongoDB Atlas (production cluster)
CDN: Cloudflare (static assets)
```

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=CertExtract
```

**Backend (.env)**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
OCR_API_KEY=your-ocr-api-key
EMAIL_SERVICE_KEY=your-email-key
```

## Performance Optimization

### Frontend

1. **Code Splitting**: Dynamic imports for large components
2. **Image Optimization**: Next.js Image component
3. **Caching**: Cache API responses
4. **Lazy Loading**: Load components on demand

### Backend

1. **Database Indexing**: Index frequently queried fields
2. **Query Optimization**: Use projection, limit results
3. **Caching**: Redis for frequently accessed data
4. **Connection Pooling**: Reuse database connections

### OCR Processing

1. **Queue System**: Process certificates in background
2. **Parallel Processing**: Handle multiple files simultaneously
3. **Image Preprocessing**: Optimize images before OCR
4. **Result Caching**: Cache OCR results

## Monitoring and Logging

### Application Monitoring

- **Uptime**: Monitor service availability
- **Response Times**: Track API performance
- **Error Rates**: Monitor error frequency
- **Resource Usage**: CPU, memory, disk

### Logging Strategy

**Log Levels:**
- INFO: Normal operations
- WARNING: Potential issues
- ERROR: Failures requiring attention

**Log Storage:**
- Development: Console
- Production: MongoDB + External service (LogRocket, Sentry)

**Log Retention:**
- 30 days minimum
- Archive older logs

## Scalability Considerations

### Horizontal Scaling

- **Frontend**: Deploy multiple instances behind load balancer
- **Backend**: Stateless design allows multiple instances
- **Database**: MongoDB sharding for large datasets

### Vertical Scaling

- Increase server resources as needed
- Optimize code and queries first

### Future Enhancements

1. **Microservices**: Split OCR processing into separate service
2. **Message Queue**: RabbitMQ/Redis for async processing
3. **CDN**: Serve static assets from CDN
4. **Caching Layer**: Redis for session and data caching
5. **API Gateway**: Centralized API management