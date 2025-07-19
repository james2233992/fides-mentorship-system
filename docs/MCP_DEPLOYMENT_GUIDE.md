# MCP Deployment Integration Guide

## 🤖 Overview

The FIDES mentorship system now includes a powerful MCP (Model Context Protocol) server that enables seamless deployment automation through Claude Code. This integration allows you to deploy to Vercel, Railway, and manage GitHub releases using natural language commands.

## 🚀 Quick Start

### 1. Build the MCP Server

```bash
cd mcp-servers/deployment-server
npm install
npm run build
```

Or use the helper script:
```bash
./scripts/mcp-deploy.sh build
```

### 2. Configure Claude Code

The MCP server is automatically configured in `.claude/mcp-settings.json`. Claude Code will detect and load it when you start a new session.

### 3. Use Natural Language Commands

In Claude Code, you can now use commands like:

- "Deploy the frontend to production using the MCP server"
- "Deploy backend to Railway and run migrations"
- "Check deployment status across all platforms"
- "Create a GitHub release for version v1.0.0"
- "Run production readiness checks"

## 📦 MCP Server Capabilities

### Frontend Deployment (Vercel)
- **Preview Deployments**: Test changes before production
- **Production Deployments**: Deploy to live environment
- **Automatic URL Generation**: Get deployment URLs instantly
- **Rollback Support**: Quickly revert to previous versions

### Backend Deployment (Railway)
- **Service Deployment**: Deploy NestJS application
- **Database Migrations**: Automatic Prisma migrations
- **Multi-Service Support**: Deploy API, workers, etc.
- **Environment Sync**: Automatic environment variable management

### GitHub Integration
- **Release Creation**: Generate releases with notes
- **Workflow Triggers**: Start CI/CD pipelines
- **Status Monitoring**: Track workflow execution
- **Deployment Tracking**: Link deployments to commits

## 🔧 Available MCP Tools

### 1. deploy_frontend
Deploy frontend to Vercel with environment selection.

**Example Usage**:
```
"Deploy frontend to production"
"Deploy frontend preview from feature branch"
```

### 2. deploy_backend
Deploy backend to Railway with optional migrations.

**Example Usage**:
```
"Deploy backend and run database migrations"
"Deploy API service without migrations"
```

### 3. check_deployment_status
Monitor deployment status across platforms.

**Example Usage**:
```
"Check deployment status for all platforms"
"Show Vercel deployment status"
```

### 4. rollback_deployment
Revert to previous deployment versions.

**Example Usage**:
```
"Rollback Vercel to previous deployment"
"Rollback Railway deployment"
```

### 5. create_github_release
Create releases with deployment information.

**Example Usage**:
```
"Create release v1.0.0 with deployment notes"
"Create pre-release for beta testing"
```

### 6. run_production_checks
Validate production readiness before deployment.

**Example Usage**:
```
"Run all production checks"
"Check production readiness without tests"
```

## 📋 Deployment Workflows

### Standard Production Deployment

1. **Run Production Checks**:
   ```
   "Run production readiness checks with all validations"
   ```

2. **Deploy Frontend**:
   ```
   "Deploy frontend to Vercel production"
   ```

3. **Deploy Backend**:
   ```
   "Deploy backend to Railway with migrations"
   ```

4. **Verify Deployment**:
   ```
   "Check deployment status for all platforms"
   ```

5. **Create Release**:
   ```
   "Create GitHub release v1.0.0 with deployment summary"
   ```

### Emergency Rollback Procedure

1. **Check Current Status**:
   ```
   "Show current deployment status"
   ```

2. **Rollback Frontend**:
   ```
   "Rollback Vercel deployment"
   ```

3. **Rollback Backend**:
   ```
   "Rollback Railway to previous version"
   ```

4. **Verify Rollback**:
   ```
   "Confirm rollback status for all platforms"
   ```

## 🔐 Security Configuration

### Token Management
All deployment tokens are stored securely in `.env.deployment`:
- Never commit this file to version control
- Rotate tokens regularly (every 90 days)
- Use environment-specific tokens when possible

### Access Control
- Limit MCP server access to authorized users
- Use role-based permissions for deployments
- Enable audit logging for all operations

## 🎯 Best Practices

### 1. Pre-Deployment Checklist
- Run all tests locally
- Check production configuration
- Verify environment variables
- Review database migrations
- Confirm rollback plan

### 2. Deployment Strategy
- Deploy to preview first
- Test in preview environment
- Get approval for production
- Deploy during low-traffic periods
- Monitor after deployment

### 3. Communication
- Notify team before deployment
- Document deployment changes
- Update status in project channels
- Create detailed release notes

## 🛠️ Troubleshooting

### MCP Server Issues

**Server not starting**:
```bash
# Check logs
cd mcp-servers/deployment-server
npm run dev

# Rebuild if needed
npm run build
```

**Authentication failures**:
- Verify tokens in `.env.deployment`
- Check token permissions
- Ensure tokens haven't expired

### Deployment Failures

**Vercel deployment fails**:
- Check build logs in Vercel dashboard
- Verify environment variables
- Ensure no ESLint errors

**Railway deployment fails**:
- Check service logs in Railway
- Verify database connection
- Ensure migrations are valid

## 📊 Monitoring Post-Deployment

### Frontend Monitoring (Vercel)
- Check Web Vitals scores
- Monitor error rates
- Review performance metrics
- Track user analytics

### Backend Monitoring (Railway)
- Monitor service health
- Check database performance
- Review error logs
- Track API response times

### Overall Health Checks
```
"Check deployment health for all services"
"Show current system status and metrics"
```

## 🔄 Continuous Improvement

### Deployment Metrics to Track
- Deployment frequency
- Lead time for changes
- Mean time to recovery
- Change failure rate

### Regular Reviews
- Weekly deployment retrospectives
- Monthly token rotation
- Quarterly security audits
- Annual disaster recovery drills

## 🆘 Emergency Contacts

### Platform Support
- **Vercel**: [status.vercel.com](https://status.vercel.com)
- **Railway**: [status.railway.app](https://status.railway.app)
- **GitHub**: [githubstatus.com](https://githubstatus.com)

### Internal Escalation
1. Check deployment logs
2. Consult this guide
3. Contact platform support
4. Escalate to team lead

## 🎉 Summary

The MCP deployment server transforms deployment from a complex manual process to simple natural language commands. By integrating with Claude Code, it provides:

- **Simplified Deployments**: Natural language commands
- **Unified Interface**: Single point for all platforms
- **Automated Workflows**: Complex operations made simple
- **Enhanced Safety**: Built-in checks and rollbacks
- **Better Visibility**: Real-time status monitoring

Start using it today with:
```
"Help me deploy the FIDES application to production"
```