# FIDES Mentorship System - Deployment Guide

## 🔐 Security Notice

**IMPORTANT**: The deployment tokens have been stored in `.env.deployment`. This file contains sensitive credentials and should:
- ✅ NEVER be committed to Git (already added to .gitignore)
- ✅ Be kept secure and private
- ✅ Be backed up in a secure password manager
- ✅ Be rotated regularly for security

## 📋 Prerequisites

Before deploying, ensure you have:
1. Node.js 18+ installed
2. Git installed and configured
3. A GitHub repository for the project
4. The `.env.deployment` file with your tokens

## 🚀 Quick Start

Run the master deployment script:

```bash
./deploy.sh
```

This interactive script will guide you through the entire deployment process.

## 📦 Deployment Platforms

### Frontend - Vercel
- **Platform**: Vercel Edge Network
- **URL**: Will be assigned after deployment (e.g., `fides-frontend.vercel.app`)
- **Features**: Global CDN, automatic HTTPS, preview deployments

### Backend - Railway
- **Platform**: Railway Container Platform
- **URL**: Will be assigned after deployment (e.g., `fides-backend.railway.app`)
- **Services**: NestJS API, PostgreSQL, Redis

### CI/CD - GitHub Actions
- **Automated deployments** on push to main branch
- **Preview deployments** for pull requests
- **Automated testing** before deployment

## 🔧 Step-by-Step Deployment

### 1. Initial Setup

#### a) Configure GitHub Secrets
```bash
./scripts/setup-github-secrets.sh
```

This will:
- Configure `VERCEL_TOKEN` and `RAILWAY_TOKEN` in GitHub
- Generate a secure JWT secret
- Provide instructions for additional secrets

#### b) Manual GitHub Secrets
Add these secrets in your GitHub repository settings:

**Vercel Secrets:**
- `VERCEL_ORG_ID`: Found in Vercel dashboard → Settings → General
- `VERCEL_PROJECT_ID`: Found after first deployment

**Backend Secrets:**
- `JWT_SECRET`: Use the generated value from setup script
- `SENDGRID_API_KEY`: Your SendGrid API key
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token

**Optional Monitoring:**
- `SENTRY_AUTH_TOKEN`: For error tracking
- `SENTRY_ORG`: Your Sentry organization
- `CODECOV_TOKEN`: For code coverage
- `SLACK_WEBHOOK`: For deployment notifications

### 2. Deploy Frontend (Vercel)

#### First Deployment:
```bash
./scripts/deploy-vercel.sh
```

This will:
1. Install dependencies
2. Build the Next.js application
3. Deploy to Vercel
4. Provide you with the deployment URL

#### Production Deployment:
```bash
./scripts/deploy-vercel.sh production
```

#### Post-Deployment:
1. Note the deployment URL
2. Get the `VERCEL_PROJECT_ID` from Vercel dashboard
3. Add it to GitHub secrets

### 3. Deploy Backend (Railway)

#### First Time Setup:
```bash
./scripts/deploy-railway.sh init
```

This will:
1. Create a new Railway project
2. Provision PostgreSQL database
3. Provision Redis instance
4. Deploy the NestJS application
5. Run database migrations
6. Optionally seed the database

#### Subsequent Deployments:
```bash
./scripts/deploy-railway.sh
```

#### Post-Deployment Configuration:

Add these environment variables in Railway dashboard:

```env
# JWT Configuration
JWT_SECRET=your-generated-jwt-secret
JWT_EXPIRES_IN=7d

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@fides.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL (update after Vercel deployment)
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# Redis (auto-configured by Railway)
REDIS_URL=${{Redis.REDIS_URL}}

# Database (auto-configured by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 4. Connect Frontend to Backend

Update Vercel environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
   ```
3. Redeploy the frontend

### 5. Verify Deployment

#### Frontend Health Check:
```bash
curl https://your-frontend.vercel.app
```

#### Backend Health Check:
```bash
curl https://your-backend.railway.app/api/health
```

## 🔄 Continuous Deployment

After initial setup, deployments are automated:

1. **Frontend**: Push to `main` branch → Automatic Vercel deployment
2. **Backend**: Push to `main` branch → Automatic Railway deployment
3. **Pull Requests**: Get preview deployments automatically

## 🛠️ Troubleshooting

### Vercel Issues

**Build Failures:**
- Check Next.js build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Node.js version compatibility

**404 Errors:**
- Check `vercel.json` configuration
- Ensure routes are properly configured

### Railway Issues

**Database Connection:**
- Verify `DATABASE_URL` is set correctly
- Check if migrations have run
- Ensure PostgreSQL addon is provisioned

**Build Failures:**
- Check Node.js version in `package.json`
- Verify all dependencies are installed
- Check Prisma schema is valid

**Migration Issues:**
```bash
# Run migrations manually
cd backend
railway run npm run prisma:migrate:deploy
```

### GitHub Actions Issues

**Secret Not Found:**
- Ensure all secrets are added in repository settings
- Check secret names match exactly
- Verify tokens haven't expired

## 📊 Monitoring

### Application Logs

**Vercel Logs:**
```bash
vercel logs --follow
```

**Railway Logs:**
```bash
railway logs --service fides-api
```

### Performance Monitoring

1. Set up Sentry for error tracking
2. Use Vercel Analytics for frontend metrics
3. Monitor Railway metrics dashboard

## 🔒 Security Best Practices

1. **Rotate Tokens Regularly**: Change deployment tokens every 90 days
2. **Use Environment Variables**: Never hardcode secrets
3. **Enable 2FA**: On GitHub, Vercel, and Railway accounts
4. **Monitor Access Logs**: Regular audit of deployment activities
5. **Backup Database**: Regular PostgreSQL backups on Railway

## 📝 Maintenance

### Update Dependencies
```bash
# Frontend
cd frontend
npm update
npm audit fix

# Backend
cd backend
npm update
npm audit fix
```

### Database Backups
Railway automatically backs up PostgreSQL. For manual backups:
```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Scaling

**Frontend (Vercel):**
- Automatic scaling with Edge Network
- No configuration needed

**Backend (Railway):**
- Horizontal scaling: Increase replicas in Railway dashboard
- Vertical scaling: Upgrade plan for more resources

## 🆘 Support

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [GitHub Actions Docs](https://docs.github.com/actions)

### Common Commands

```bash
# Check deployment status
./deploy.sh
# Option 6

# Full deployment
./deploy.sh
# Option 4

# View logs
vercel logs
railway logs

# Run migrations
cd backend
railway run npm run prisma:migrate:deploy
```

## ✅ Deployment Checklist

- [ ] `.env.deployment` file created and secured
- [ ] GitHub secrets configured
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Database migrations run
- [ ] Environment variables set in both platforms
- [ ] Frontend connected to backend API
- [ ] Health checks passing
- [ ] CI/CD pipelines working
- [ ] Monitoring configured

---

**Remember**: Keep your deployment tokens secure and never share them publicly!