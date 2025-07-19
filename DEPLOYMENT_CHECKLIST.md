# FIDES Production Deployment Checklist

## 🚀 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All features tested locally
- [ ] Code reviewed and approved
- [ ] Tests passing (when implemented)
- [ ] No console.log statements in production code
- [ ] Environment variables documented
- [ ] Database migrations tested

### 2. Security Review
- [ ] Remove default JWT secret in backend config
- [ ] All secrets stored in environment variables
- [ ] CORS configured for production domain
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] API documentation protected in production

### 3. Infrastructure Setup
- [ ] GitHub repository created
- [ ] Vercel account created and project linked
- [ ] Railway account created and project initialized
- [ ] PostgreSQL database provisioned on Railway
- [ ] Redis instance provisioned on Railway
- [ ] SendGrid account configured
- [ ] Twilio account configured (if using SMS)

### 4. Environment Configuration
- [ ] Frontend `.env.production` configured
- [ ] Backend `.env.production` configured
- [ ] All API keys and secrets obtained
- [ ] Domain names configured (if custom domains)

### 5. GitHub Secrets
Add these secrets to your GitHub repository (Settings → Secrets → Actions):

- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `RAILWAY_TOKEN`
- [ ] `SENTRY_AUTH_TOKEN` (optional)
- [ ] `SENTRY_ORG` (optional)
- [ ] `SLACK_WEBHOOK` (optional)

## 📋 Deployment Steps

### Step 1: Initial Setup
```bash
# Run the setup script
cd infrastructure/scripts
./setup-deployment.sh
```

### Step 2: Database Setup
```bash
# Create production database schema
cd backend
railway run npm run prisma:migrate:deploy
```

### Step 3: First Deployment

#### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

#### Backend (Railway)
```bash
cd backend
railway up
```

### Step 4: Verify Deployment
```bash
# Run health checks
cd infrastructure/scripts
./health-check.sh
```

### Step 5: Configure Monitoring
1. Set up Sentry projects for frontend and backend
2. Configure uptime monitoring (Better Uptime, Pingdom, etc.)
3. Set up log aggregation (Railway logs, LogTail, etc.)
4. Configure alerts based on `infrastructure/monitoring/alerts.yml`

## 🔄 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Verify all endpoints are accessible
- [ ] Test user registration and login
- [ ] Test session creation flow
- [ ] Verify email notifications working
- [ ] Check WebSocket connections
- [ ] Monitor error rates in Sentry
- [ ] Set up SSL certificates (auto on Vercel/Railway)

### Short-term (Week 1)
- [ ] Configure custom domains
- [ ] Set up automated backups
- [ ] Implement health check monitoring
- [ ] Configure alert thresholds
- [ ] Document deployment process
- [ ] Create runbooks for common issues

### Long-term (Month 1)
- [ ] Performance baseline established
- [ ] Cost optimization review
- [ ] Security audit completed
- [ ] Disaster recovery plan tested
- [ ] Team training on deployment process
- [ ] CI/CD pipeline optimizations

## 🚨 Rollback Procedure

### Frontend Rollback
```bash
# Via Vercel Dashboard
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click "..." → "Promote to Production"

# Via CLI
vercel rollback
```

### Backend Rollback
```bash
# Via Railway Dashboard
# 1. Go to Deployments
# 2. Find previous deployment
# 3. Click "Redeploy"

# Via CLI
railway rollback
```

### Database Rollback
```bash
# Always backup before migrations!
railway run npm run prisma:migrate:reset
railway run npm run prisma:migrate:deploy
```

## 📞 Emergency Contacts

- **On-Call Engineer**: [Phone Number]
- **CTO**: [Phone Number]
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Sentry Alerts**: #critical-alerts (Slack)

## 🔍 Common Issues

### Frontend Issues
1. **Build Failures**
   - Check environment variables
   - Verify Node.js version
   - Clear Vercel cache

2. **404 Errors**
   - Check routing configuration
   - Verify API URL in environment

### Backend Issues
1. **Database Connection**
   - Verify DATABASE_URL
   - Check Railway private networking
   - Ensure migrations are run

2. **Redis Connection**
   - Verify REDIS_URL
   - Check Redis service status
   - Monitor memory usage

### Performance Issues
1. **Slow API Response**
   - Check database indexes
   - Monitor query performance
   - Scale Railway instances

2. **High Memory Usage**
   - Check for memory leaks
   - Optimize queries
   - Scale resources

## ✅ Sign-Off

- [ ] Deployment completed successfully
- [ ] All checks passed
- [ ] Monitoring configured
- [ ] Team notified

**Deployed by**: ________________________  
**Date**: ________________________  
**Version**: ________________________