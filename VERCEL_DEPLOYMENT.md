# Vercel Frontend Deployment Guide

## Quick Setup via Vercel Web Interface

Since we're having issues with CLI deployment, use the web interface:

1. **Go to Vercel Dashboard**: https://vercel.com/new

2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select `james2233992/fides-mentorship-system`
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `frontend`
     - Build Command: (leave default)
     - Output Directory: (leave default)
     - Install Command: (leave default)

3. **Environment Variables**:
   Add these in the "Environment Variables" section:
   ```
   NEXT_PUBLIC_API_URL=https://fides-backend-production.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://fides-backend-production.up.railway.app
   NEXT_PUBLIC_APP_NAME=FIDES Mentorship
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

5. **Custom Domain** (Optional):
   - Go to Settings → Domains
   - Add your custom domain

## Alternative: Deploy via GitHub Integration

1. **Connect Vercel to GitHub**:
   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import from Git Repository
   - Select the `fides-mentorship-system` repository

2. **Configure Build Settings**:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
   - Node.js Version: 18.x

3. **Add Environment Variables** (same as above)

4. **Enable Automatic Deployments**:
   - Vercel will automatically deploy on every push to main branch

## Verify Deployment

Your frontend will be available at:
- Preview: `https://fides-mentorship-system-[hash].vercel.app`
- Production: `https://fides-mentorship-system.vercel.app`

Test the deployment:
```bash
curl https://your-app.vercel.app
```

## Troubleshooting

If build fails:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set correctly
4. Check that Railway backend is deployed and accessible