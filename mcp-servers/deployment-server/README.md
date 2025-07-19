# FIDES Deployment MCP Server

MCP (Model Context Protocol) server for automating deployments to Vercel, Railway, and GitHub.

## 🚀 Features

- **Automated Frontend Deployment** to Vercel
- **Automated Backend Deployment** to Railway with database migrations
- **GitHub Release Management** with automated release notes
- **Deployment Status Monitoring** across all platforms
- **Rollback Capabilities** for quick recovery
- **Production Readiness Checks** before deployment

## 📋 Prerequisites

1. Node.js 18+
2. Deployment tokens configured in `.env.deployment`
3. Claude Code with MCP support

## 🔧 Installation

```bash
cd mcp-servers/deployment-server
npm install
npm run build
```

## 🔐 Configuration

Ensure your `.env.deployment` file contains:

```env
VERCEL_TOKEN=your-vercel-token
RAILWAY_TOKEN=your-railway-token
GITHUB_TOKEN=your-github-token
```

## 🛠️ Available Tools

### deploy_frontend
Deploy frontend application to Vercel.

```typescript
// Parameters
{
  environment: "preview" | "production",
  branch?: string // defaults to "main"
}

// Example usage in Claude Code
Deploy the frontend to production
```

### deploy_backend
Deploy backend application to Railway with optional database migrations.

```typescript
// Parameters
{
  service?: string, // defaults to "fides-api"
  runMigrations?: boolean // defaults to true
}

// Example usage in Claude Code
Deploy the backend and run migrations
```

### check_deployment_status
Check deployment status across all platforms.

```typescript
// Parameters
{
  platform?: "vercel" | "railway" | "all" // defaults to "all"
}

// Example usage in Claude Code
Check the deployment status for all platforms
```

### rollback_deployment
Rollback to a previous deployment.

```typescript
// Parameters
{
  platform: "vercel" | "railway",
  deploymentId?: string // optional specific deployment
}

// Example usage in Claude Code
Rollback the Vercel deployment
```

### create_github_release
Create a GitHub release with deployment information.

```typescript
// Parameters
{
  version: string, // e.g., "v1.0.0"
  description: string,
  prerelease?: boolean // defaults to false
}

// Example usage in Claude Code
Create a GitHub release for version v1.0.0
```

### run_production_checks
Run production readiness checks before deployment.

```typescript
// Parameters
{
  includeTests?: boolean, // defaults to true
  includeSecurity?: boolean // defaults to true
}

// Example usage in Claude Code
Run all production checks before deployment
```

## 📝 Usage with Claude Code

1. **Enable MCP Server**: The server is automatically configured in `.claude/mcp-settings.json`

2. **Deploy Frontend**:
   ```
   Use the deployment MCP server to deploy the frontend to production
   ```

3. **Deploy Backend**:
   ```
   Deploy the backend to Railway and run database migrations
   ```

4. **Full Production Deployment**:
   ```
   1. Run production checks
   2. Deploy frontend to Vercel production
   3. Deploy backend to Railway
   4. Create a GitHub release v1.0.0
   ```

5. **Monitor Deployments**:
   ```
   Check deployment status across all platforms
   ```

## 🔄 Deployment Workflow

### Standard Deployment Process

1. **Pre-deployment Checks**:
   ```
   Run production readiness checks
   ```

2. **Deploy Frontend**:
   ```
   Deploy frontend to Vercel production
   ```

3. **Deploy Backend**:
   ```
   Deploy backend to Railway with migrations
   ```

4. **Verify Deployment**:
   ```
   Check deployment status for all platforms
   ```

5. **Create Release**:
   ```
   Create GitHub release for the deployment
   ```

### Emergency Rollback

If issues occur after deployment:

```
1. Rollback Vercel deployment
2. Rollback Railway deployment
3. Check status to confirm rollback
```

## 🎯 Best Practices

1. **Always run production checks** before deploying
2. **Deploy to preview/staging** first, then production
3. **Monitor deployment status** after each deployment
4. **Create releases** to track deployment history
5. **Test rollback procedures** regularly

## 🐛 Troubleshooting

### MCP Server Not Found
```bash
# Rebuild the server
cd mcp-servers/deployment-server
npm run build
```

### Authentication Errors
- Verify tokens in `.env.deployment`
- Ensure tokens have necessary permissions
- Check token expiration

### Deployment Failures
- Check platform-specific logs
- Verify environment variables
- Ensure all dependencies are installed

## 🔗 Integration with CI/CD

The MCP server complements existing GitHub Actions workflows:

1. **Manual Deployments**: Use MCP for on-demand deployments
2. **Automated Deployments**: GitHub Actions for push-triggered deployments
3. **Emergency Operations**: MCP for rollbacks and hotfixes

## 📊 Monitoring

After deployment, monitor your applications:

- **Vercel**: Check Vercel dashboard for analytics
- **Railway**: Monitor Railway dashboard for logs
- **GitHub**: Review Actions tab for CI/CD status

## 🆘 Support

For issues or questions:
1. Check deployment logs
2. Review platform documentation
3. Verify MCP server logs
4. Check token permissions