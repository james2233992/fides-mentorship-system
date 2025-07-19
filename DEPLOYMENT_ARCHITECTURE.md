# FIDES Mentorship System - Production Deployment Architecture

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "GitHub Repository"
        GH[GitHub Repo]
        GA[GitHub Actions]
    end
    
    subgraph "Frontend - Vercel"
        V[Vercel Platform]
        VE[Edge Network]
        VF[Next.js Frontend]
    end
    
    subgraph "Backend - Railway"
        R[Railway Platform]
        RN[NestJS Backend]
        RP[PostgreSQL]
        RR[Redis]
    end
    
    subgraph "External Services"
        SG[SendGrid]
        TW[Twilio]
        S3[AWS S3/Cloudinary]
    end
    
    subgraph "Monitoring"
        SE[Sentry]
        LT[LogTail]
        UM[Uptime Monitor]
    end
    
    GH -->|Deploy Frontend| V
    GH -->|Deploy Backend| R
    VE -->|API Requests| RN
    VE -->|WebSocket| RN
    RN --> RP
    RN --> RR
    RN --> SG
    RN --> TW
    RN --> S3
    V --> SE
    R --> SE
    R --> LT
```

## 🚀 Platform Overview

### Frontend: Vercel
- **Platform**: Vercel (optimal for Next.js)
- **Features**: Edge deployment, automatic HTTPS, global CDN
- **Domains**: Custom domain support with SSL
- **Environment**: Production environment variables

### Backend: Railway
- **Platform**: Railway (container-based deployment)
- **Services**: 
  - NestJS API container
  - PostgreSQL database
  - Redis for queuing
- **Features**: Automatic scaling, private networking, built-in monitoring

### CI/CD: GitHub Actions
- **Automation**: Continuous deployment on push to main
- **Testing**: Automated test runs before deployment
- **Security**: Secret management via GitHub Secrets

## 📁 Project Structure for Deployment

```
fides-mentorship-system/
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml    # Vercel deployment
│       ├── deploy-backend.yml     # Railway deployment
│       └── test-and-lint.yml      # CI checks
├── frontend/
│   ├── vercel.json               # Vercel configuration
│   ├── .env.production           # Production environment
│   └── next.config.mjs           # Next.js config
├── backend/
│   ├── railway.json              # Railway configuration
│   ├── Dockerfile.production     # Optimized Docker image
│   └── .env.production           # Production environment
└── infrastructure/
    ├── scripts/
    │   ├── setup-vercel.sh
    │   ├── setup-railway.sh
    │   └── migrate-db.sh
    └── monitoring/
        └── alerts.yml

```

## 🔧 Service Configuration

### 1. Vercel (Frontend)

**vercel.json**:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@production_api_url",
    "NEXT_PUBLIC_WS_URL": "@production_ws_url",
    "NEXT_PUBLIC_APP_NAME": "FIDES Mentorship",
    "NEXT_PUBLIC_SENTRY_DSN": "@sentry_dsn_frontend"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 2. Railway (Backend)

**railway.json**:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "./Dockerfile.production"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  },
  "services": [
    {
      "name": "fides-api",
      "source": "backend",
      "builder": "DOCKERFILE",
      "env": {
        "PORT": "${{PORT}}",
        "NODE_ENV": "production"
      }
    },
    {
      "name": "postgres",
      "image": "postgres:15-alpine",
      "volumes": ["/var/lib/postgresql/data"],
      "env": {
        "POSTGRES_DB": "fides_production",
        "POSTGRES_USER": "${{POSTGRES_USER}}",
        "POSTGRES_PASSWORD": "${{POSTGRES_PASSWORD}}"
      }
    },
    {
      "name": "redis",
      "image": "redis:7-alpine",
      "volumes": ["/data"]
    }
  ]
}
```

### 3. Environment Configuration

**Production Environment Variables**:

#### Frontend (.env.production)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://fides-api.railway.app/api
NEXT_PUBLIC_WS_URL=wss://fides-api.railway.app

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=true

# External Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Backend (.env.production)
```env
# Database
DATABASE_URL=postgresql://user:password@postgres.railway.internal:5432/fides_production

# Redis
REDIS_URL=redis://redis.railway.internal:6379

# Security
JWT_SECRET=${RAILWAY_JWT_SECRET}
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=https://fides.vercel.app

# Email (SendGrid)
SENDGRID_API_KEY=${RAILWAY_SENDGRID_KEY}
EMAIL_FROM=noreply@fides.edu

# SMS (Twilio)
TWILIO_ACCOUNT_SID=${RAILWAY_TWILIO_SID}
TWILIO_AUTH_TOKEN=${RAILWAY_TWILIO_TOKEN}
TWILIO_PHONE_NUMBER=${RAILWAY_TWILIO_PHONE}

# File Storage
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=${RAILWAY_AWS_KEY}
AWS_SECRET_ACCESS_KEY=${RAILWAY_AWS_SECRET}
AWS_S3_BUCKET=fides-uploads
AWS_S3_REGION=us-east-1

# Monitoring
SENTRY_DSN=${RAILWAY_SENTRY_DSN}
LOG_LEVEL=info
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/deploy-frontend.yml**:
```yaml
name: Deploy Frontend to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy-frontend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
        
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
        
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
        
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: ./frontend
```

**.github/workflows/deploy-backend.yml**:
```yaml
name: Deploy Backend to Railway

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
        
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        working-directory: ./backend
        
      - name: Run Database Migrations
        run: railway run npm run prisma:migrate:deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        working-directory: ./backend
```

## 🚦 Deployment Process

### Initial Setup

1. **Vercel Setup**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
cd frontend
vercel link

# Configure project
vercel env pull
```

2. **Railway Setup**:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Link PostgreSQL and Redis
railway add postgresql
railway add redis
```

3. **GitHub Secrets Configuration**:
```
VERCEL_TOKEN: Your Vercel API token
RAILWAY_TOKEN: Your Railway API token
SENTRY_DSN: Sentry project DSN
SENDGRID_API_KEY: SendGrid API key
TWILIO_ACCOUNT_SID: Twilio account SID
TWILIO_AUTH_TOKEN: Twilio auth token
```

### Deployment Commands

**Manual Deployment**:
```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd backend
railway up
```

**Database Migration**:
```bash
# Production migration
railway run npm run prisma:migrate:deploy
```

## 📊 Monitoring & Logging

### 1. Application Monitoring (Sentry)
- Error tracking for frontend and backend
- Performance monitoring
- Release tracking
- User feedback collection

### 2. Log Management (LogTail/Railway Logs)
- Centralized logging
- Log aggregation and search
- Alert on error patterns

### 3. Uptime Monitoring
- Health check endpoints
- SSL certificate monitoring
- Response time tracking
- Incident alerts

### 4. Performance Monitoring
- Core Web Vitals (Vercel Analytics)
- API response times
- Database query performance
- Redis queue metrics

## 🔐 Security Considerations

### 1. Environment Security
- All secrets stored in platform vaults
- No secrets in code repository
- Environment-specific configurations

### 2. Network Security
- HTTPS enforced on all endpoints
- Private networking between Railway services
- IP whitelisting for database access

### 3. Application Security
- Rate limiting on API endpoints
- CORS properly configured
- Security headers via Vercel
- Regular dependency updates

## 📈 Scaling Strategy

### Frontend (Vercel)
- Automatic edge scaling
- Global CDN distribution
- ISR for dynamic content
- Image optimization

### Backend (Railway)
- Horizontal scaling (multiple instances)
- Database connection pooling
- Redis for session management
- Queue workers scaling

## 🛠️ Maintenance

### Regular Tasks
1. **Weekly**:
   - Review error logs
   - Check performance metrics
   - Update dependencies

2. **Monthly**:
   - Database backup verification
   - Security audit
   - Cost optimization review

3. **Quarterly**:
   - Load testing
   - Disaster recovery drill
   - Architecture review

## 💰 Cost Estimation

### Vercel (Frontend)
- **Hobby**: $0/month (limited)
- **Pro**: $20/month per member
- **Features**: 1TB bandwidth, 100GB-hours compute

### Railway (Backend)
- **Starter**: $5/month
- **Services**:
  - API: ~$20-40/month
  - PostgreSQL: ~$15-25/month
  - Redis: ~$10-15/month
- **Total**: ~$50-80/month

### Additional Services
- SendGrid: $0-20/month
- Twilio: Pay-as-you-go
- Sentry: $0-26/month
- Domain: ~$15/year

**Estimated Total**: $75-150/month

## 🚨 Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups (Railway)
- **Files**: S3 versioning enabled
- **Code**: GitHub repository

### Recovery Procedures
1. Database restoration from backup
2. Redis cache rebuild
3. Frontend redeployment
4. DNS failover (if needed)

### RTO/RPO Targets
- **RTO**: 30 minutes
- **RPO**: 1 hour
- **Uptime Target**: 99.9%