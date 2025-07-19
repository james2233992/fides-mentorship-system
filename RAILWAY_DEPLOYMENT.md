# Railway Backend Deployment Guide

## Quick Setup via Railway Web Interface

1. **Go to Railway Dashboard**: https://railway.app/new

2. **Deploy from GitHub**:
   - Click "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select repository: `james2233992/fides-mentorship-system`
   - Select branch: `main`

3. **Configure Service**:
   - Service name: `fides-backend`
   - Root directory: `/backend`
   - Start command will be auto-detected from package.json

4. **Add PostgreSQL**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically inject DATABASE_URL

5. **Add Redis**:
   - Click "New" → "Database" → "Add Redis"
   - Railway will automatically inject REDIS_URL

6. **Set Environment Variables**:
   Click on your service and go to "Variables" tab, then add:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-here-change-this
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://fides-frontend.vercel.app
   FRONTEND_URL=https://fides-frontend.vercel.app
   
   # Email (optional for now)
   SENDGRID_API_KEY=your-sendgrid-key
   EMAIL_FROM=noreply@fides.com
   
   # SMS (optional for now)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth
   TWILIO_PHONE_NUMBER=+1234567890
   ```

7. **Deploy**:
   - Railway will automatically deploy when you save the environment variables
   - Check the deployment logs in the "Deployments" tab

8. **Run Migrations**:
   - Once deployed, go to your service
   - Click "Settings" → "Generate Domain" to get your public URL
   - In the service, run command: `npm run prisma:migrate:deploy`

9. **Your Backend URL**:
   - After deployment, Railway will provide a URL like: `https://fides-backend-production.up.railway.app`
   - Note this URL - you'll need it for the frontend configuration

## Verify Deployment

Test your API endpoint:
```bash
curl https://your-app.railway.app/api/health
```

Should return:
```json
{"status":"ok"}
```