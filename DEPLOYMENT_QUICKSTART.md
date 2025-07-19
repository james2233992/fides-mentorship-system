# 🚀 FIDES Deployment Quick Start Guide

Deploy your FIDES Mentorship System to production in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- Git repository with your code
- GitHub account
- Vercel account (free tier works)
- Railway account (free trial available)

## 🏃 Quick Deploy Steps

### 1️⃣ Clone and Prepare (2 min)
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/fides-mentorship-system.git
cd fides-mentorship-system

# Copy environment templates
cp frontend/.env.production.example frontend/.env.production
cp backend/.env.production.example backend/.env.production
```

### 2️⃣ Deploy Frontend to Vercel (5 min)

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select `frontend` as the root directory
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.railway.app/api
   NEXT_PUBLIC_WS_URL=wss://YOUR-BACKEND.railway.app
   ```
5. Click "Deploy"

#### Option B: Via CLI
```bash
npm i -g vercel
cd frontend
vercel
# Follow prompts, select "frontend" directory
```

### 3️⃣ Deploy Backend to Railway (5 min)

#### Option A: Via Railway Dashboard (Recommended)
1. Go to [railway.app/new](https://railway.app/new)
2. Choose "Deploy from GitHub repo"
3. Select your repository
4. Add services:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Click "+ New" → "Database" → "Redis"
5. Configure environment variables in the backend service
6. Deploy!

#### Option B: Via CLI
```bash
npm i -g @railway/cli
cd backend
railway login
railway init
railway add postgresql
railway add redis
railway up
```

### 4️⃣ Configure Environment Variables (3 min)

#### Update Frontend (Vercel)
Go to Vercel Dashboard → Settings → Environment Variables:
```env
NEXT_PUBLIC_API_URL=https://YOUR-APP.railway.app/api
NEXT_PUBLIC_WS_URL=wss://YOUR-APP.railway.app
```

#### Update Backend (Railway)
Go to Railway Dashboard → Variables:
```env
DATABASE_URL=${PGDATABASE_URL}
REDIS_URL=${REDIS_URL}
JWT_SECRET=your-super-secret-key-min-32-chars
CORS_ORIGIN=https://YOUR-APP.vercel.app
EMAIL_FROM=noreply@yourdomain.com
```

### 5️⃣ Run Database Migrations
```bash
cd backend
railway run npm run prisma:migrate:deploy
railway run npm run prisma:seed # Optional: seed data
```

### 6️⃣ Verify Deployment
```bash
# Test your endpoints
curl https://YOUR-APP.vercel.app
curl https://YOUR-BACKEND.railway.app/api/health
```

## 🎉 You're Live!

Your FIDES Mentorship System is now deployed:
- Frontend: `https://YOUR-APP.vercel.app`
- Backend API: `https://YOUR-BACKEND.railway.app/api`

## 📱 Next Steps

### Essential Configuration
1. **Custom Domain** (Optional)
   - Vercel: Settings → Domains → Add
   - Railway: Settings → Domains → Generate Domain

2. **Email Setup** (SendGrid)
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Get API key
   - Add to Railway: `SENDGRID_API_KEY=your-key`

3. **Enable GitHub Auto-Deploy**
   - Add GitHub Actions secrets:
   ```bash
   # Get tokens from:
   # Vercel: Account Settings → Tokens
   # Railway: Account Settings → Tokens
   
   VERCEL_TOKEN=xxx
   RAILWAY_TOKEN=xxx
   ```

### Monitoring Setup (Optional but Recommended)
1. **Sentry** (Error Tracking)
   ```bash
   # Sign up at sentry.io
   # Create projects for frontend and backend
   # Add DSN to environment variables
   ```

2. **Better Uptime** (Monitoring)
   ```bash
   # Sign up at betteruptime.com
   # Add monitors for:
   # - https://YOUR-APP.vercel.app
   # - https://YOUR-BACKEND.railway.app/api/health
   ```

## 🆘 Troubleshooting

### Common Issues

**Frontend not loading?**
- Check API URL in Vercel environment variables
- Verify CORS settings in backend

**Database connection failed?**
- Check DATABASE_URL in Railway
- Run migrations: `railway run npm run prisma:migrate:deploy`

**WebSocket not connecting?**
- Ensure WSS URL is correct in frontend
- Check CORS allows WebSocket origin

**Build failed?**
- Check build logs in Vercel/Railway
- Verify Node.js version compatibility
- Clear cache and redeploy

### Quick Fixes

```bash
# Restart services
railway restart

# View logs
railway logs
vercel logs

# Force redeploy
vercel --force
railway up --force
```

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/deployment)

## 💡 Pro Tips

1. **Use Railway's Private Networking** for database connections
2. **Enable Vercel's Edge Functions** for better performance
3. **Set up staging environments** before going to production
4. **Monitor costs** - both platforms have generous free tiers
5. **Enable automatic backups** for your database

---

Need help? Check the [full deployment guide](./DEPLOYMENT_ARCHITECTURE.md) or open an issue!