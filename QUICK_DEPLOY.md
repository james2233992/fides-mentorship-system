# 🚀 Quick Deploy Guide - FIDES Mentorship System

## Current Status
✅ Code ready and pushed to GitHub  
✅ All configurations prepared  
⏳ Waiting for manual deployment  

## Step 1: Deploy Backend to Railway (15 minutes)

### 1.1 Create Railway Project
1. Go to: https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Authorize GitHub if needed
4. Select: `james2233992/fides-mentorship-system`
5. Railway will create the project

### 1.2 Configure the Service
1. Click on the deployed service
2. Go to **Settings** tab:
   - Root Directory: `/backend`
   - Start Command: `npm run start:prod`
   - Click **"Generate Domain"** to get your URL
   - Save the URL (you'll need it for frontend)

### 1.3 Add Databases
1. Click **"New"** button in your project
2. Select **"Database"** → **"Add PostgreSQL"**
3. Click **"New"** again
4. Select **"Database"** → **"Add Redis"**

### 1.4 Set Environment Variables
Go to **Variables** tab and add:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-please
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://fides-frontend.vercel.app
FRONTEND_URL=https://fides-frontend.vercel.app
SENDGRID_API_KEY=SG.fake-key-for-now
EMAIL_FROM=noreply@fides.com
TWILIO_ACCOUNT_SID=AC-fake-sid-for-now
TWILIO_AUTH_TOKEN=fake-auth-for-now
TWILIO_PHONE_NUMBER=+1234567890
```

### 1.5 Deploy & Migrate
1. Railway will auto-deploy after saving variables
2. Once deployed, run migrations:
   - Click **"Settings"** → **"Command Palette"** (or press Cmd/Ctrl + K)
   - Type: `railway run npm run prisma:migrate:deploy`
   - Press Enter

### 1.6 Verify Backend
```bash
curl https://your-backend-url.railway.app/api/health
```
Should return: `{"status":"ok"}`

**Save your backend URL:** `https://fides-backend-production-xxxx.up.railway.app`

---

## Step 2: Deploy Frontend to Vercel (10 minutes)

### 2.1 Create Vercel Project
1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `james2233992/fides-mentorship-system`

### 2.2 Configure Build Settings
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: **`frontend`**
- Node.js Version: **18.x**

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| NEXT_PUBLIC_API_URL | `https://your-railway-backend-url.railway.app` |
| NEXT_PUBLIC_WS_URL | `wss://your-railway-backend-url.railway.app` |
| NEXT_PUBLIC_APP_NAME | FIDES Mentorship |

**Important:** Replace `your-railway-backend-url` with your actual Railway URL from Step 1.6

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (3-5 minutes)
3. Your app will be live at: `https://fides-mentorship-system.vercel.app`

---

## Step 3: Test Your Application (5 minutes)

### 3.1 Basic Tests
1. Visit your frontend URL
2. Click **"Registrarse"** (Register)
3. Create a test account:
   - Choose role: Mentor or Mentee
   - Fill in the form
   - Submit

### 3.2 Login Test
1. Login with your test account
2. Browse the dashboard
3. Try sending a mentorship request

### 3.3 If Something Goes Wrong
- **Frontend not loading?** Check browser console for errors
- **Can't register?** Check Railway logs for backend errors
- **CORS errors?** Update CORS_ORIGIN in Railway with your Vercel URL

---

## 🎉 Deployment Complete!

### Your Live URLs:
- **Frontend:** `https://fides-mentorship-system.vercel.app`
- **Backend API:** `https://your-backend.railway.app`
- **API Docs:** `https://your-backend.railway.app/api`

### What's Working:
- ✅ User registration and login
- ✅ Role-based access (Admin, Mentor, Mentee)
- ✅ Mentorship requests
- ✅ Real-time messaging
- ✅ Session scheduling
- ✅ Goal tracking

### Next Steps:
1. **Custom Domain** (optional):
   - Add custom domain in Vercel settings
   - Update CORS_ORIGIN in Railway

2. **Email/SMS** (when ready):
   - Get real SendGrid API key
   - Get real Twilio credentials
   - Update in Railway variables

3. **Monitoring**:
   - Set up Sentry for error tracking
   - Enable Vercel Analytics
   - Monitor Railway metrics

---

## 🆘 Quick Troubleshooting

### Backend Issues
```bash
# View Railway logs
railway logs --service fides-api

# Test API directly
curl -X POST https://your-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","firstName":"Test","lastName":"User","role":"mentee"}'
```

### Frontend Issues
```bash
# View Vercel logs
vercel logs --follow

# Check build output
vercel inspect your-deployment-url
```

### Database Issues
```bash
# Connect to Railway database
railway run npx prisma studio

# Reset database (careful!)
railway run npm run prisma:migrate:reset
```

---

## 📞 Need Help?

1. **Railway Issues**: Check https://railway.app/help
2. **Vercel Issues**: Check https://vercel.com/guides
3. **Code Issues**: Check https://github.com/james2233992/fides-mentorship-system/issues

Remember: Both platforms offer free tiers that should be sufficient for testing and initial deployment!