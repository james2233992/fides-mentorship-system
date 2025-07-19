# FIDES Mentorship System - Security Implementation

## Security Features Implemented

### 1. **Rate Limiting**
- Global rate limiting: 10 requests per minute per IP
- Login endpoint: 5 requests per minute
- Registration endpoint: 3 requests per minute
- Implemented using @nestjs/throttler

### 2. **CORS Configuration**
- Environment-specific origins
- Production: Only allows configured APP_URL
- Development: Allows localhost:3000 and localhost:3001
- Credentials enabled for cookie-based authentication

### 3. **Helmet.js Integration**
- Content Security Policy (CSP) configured
- XSS protection
- Prevents clickjacking
- HSTS headers for HTTPS enforcement

### 4. **Input Validation**
- Strong password requirements:
  - Minimum 8 characters
  - Must contain uppercase, lowercase, number, and special character
- Email validation and normalization
- Phone number validation (Colombian format)
- UUID validation for IDs
- Date validation for sessions
- Length limits on all string inputs

### 5. **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Protected routes with guards

### 6. **Error Handling**
- Custom error interceptor
- Sensitive information redaction
- Proper HTTP status codes
- Prisma error handling

### 7. **Data Sanitization**
- Input trimming and transformation
- HTML tag removal
- SQL injection prevention
- XSS prevention

### 8. **Session Security**
- Future date validation for scheduling
- Meeting link generation security
- Access control for session data

## Security Configuration

### Environment Variables
```env
# Security-related configurations
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
JWT_EXPIRATION=7d
APP_URL=https://your-domain.com
```

### Additional Security Recommendations

1. **HTTPS Only**
   - Always use HTTPS in production
   - Enable HSTS headers
   - Use secure cookies

2. **Database Security**
   - Use parameterized queries (handled by Prisma)
   - Regular backups
   - Encrypted connections

3. **API Security**
   - API key for external services
   - Request signing for webhooks
   - IP whitelisting for admin endpoints

4. **Monitoring**
   - Log all authentication attempts
   - Monitor rate limit violations
   - Set up alerts for suspicious activities

5. **Regular Updates**
   - Keep dependencies updated
   - Security patches
   - Regular security audits

## Security Utilities

Located in `/src/common/utils/security.utils.ts`:
- `sanitizeInput()` - Remove dangerous characters
- `generateSecureToken()` - Create cryptographically secure tokens
- `hashData()` - SHA-256 hashing
- `isValidUrl()` - Prevent SSRF attacks
- `redactSensitiveData()` - Remove sensitive info from logs

## Testing Security

1. **Rate Limiting Test**
   ```bash
   # Test rate limiting
   for i in {1..15}; do curl -X POST http://localhost:3001/api/auth/login; done
   ```

2. **Input Validation Test**
   ```bash
   # Test with invalid data
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"invalid","password":"weak"}'
   ```

3. **CORS Test**
   ```bash
   # Test from unauthorized origin
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Origin: http://evil-site.com"
   ```

## Compliance

This implementation follows:
- OWASP Top 10 security practices
- GDPR requirements for data protection
- Industry standard authentication practices
- Colombian data protection regulations