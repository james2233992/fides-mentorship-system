#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script checks if both frontend and backend deployments are working correctly
 * by testing key endpoints and features.
 */

const https = require('https');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const FRONTEND_URL = 'https://fides-mentorship-system-t8ey.vercel.app';
const BACKEND_URL = 'https://fides-mentorship-system-production.up.railway.app';
const API_URL = `${BACKEND_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Deployment-Verifier/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkFrontend() {
  log('\n🌐 Checking Frontend Deployment...', 'cyan');
  
  try {
    // Check if homepage loads
    log('  → Checking homepage...', 'yellow');
    const homepage = await makeRequest(FRONTEND_URL);
    if (homepage.statusCode === 200) {
      log('  ✓ Homepage loads successfully', 'green');
    } else {
      log(`  ✗ Homepage returned status ${homepage.statusCode}`, 'red');
    }

    // Check if login page loads
    log('  → Checking login page...', 'yellow');
    const loginPage = await makeRequest(`${FRONTEND_URL}/login`);
    if (loginPage.statusCode === 200) {
      log('  ✓ Login page loads successfully', 'green');
      
      // Check for emergency fix script
      if (loginPage.body.includes('emergency-fix.js')) {
        log('  ✓ Emergency fix script is included', 'green');
      } else {
        log('  ⚠ Emergency fix script not found', 'yellow');
      }
      
      // Check for error boundary
      if (loginPage.body.includes('error-boundary') || loginPage.body.includes('ErrorBoundary')) {
        log('  ✓ Error boundary is present', 'green');
      } else {
        log('  ⚠ Error boundary not found', 'yellow');
      }
    } else {
      log(`  ✗ Login page returned status ${loginPage.statusCode}`, 'red');
    }

    // Check static assets
    log('  → Checking static assets...', 'yellow');
    const emergencyFix = await makeRequest(`${FRONTEND_URL}/emergency-fix.js`);
    if (emergencyFix.statusCode === 200) {
      log('  ✓ Emergency fix script is accessible', 'green');
    } else {
      log('  ✗ Emergency fix script not accessible', 'red');
    }

  } catch (error) {
    log(`  ✗ Frontend check failed: ${error.message}`, 'red');
  }
}

async function checkBackend() {
  log('\n🔧 Checking Backend Deployment...', 'cyan');
  
  try {
    // Check API root
    log('  → Checking API root...', 'yellow');
    const apiRoot = await makeRequest(API_URL);
    if (apiRoot.statusCode === 200) {
      log('  ✓ API is accessible', 'green');
    } else {
      log(`  ✗ API returned status ${apiRoot.statusCode}`, 'red');
    }

    // Check Swagger docs
    log('  → Checking Swagger documentation...', 'yellow');
    const swagger = await makeRequest(`${API_URL}/docs`);
    if (swagger.statusCode === 200) {
      log('  ✓ Swagger docs are accessible', 'green');
    } else {
      log(`  ⚠ Swagger docs returned status ${swagger.statusCode}`, 'yellow');
    }

    // Check CORS preflight
    log('  → Checking CORS configuration...', 'yellow');
    const corsCheck = await makeRequest(`${API_URL}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    
    if (corsCheck.statusCode === 204 || corsCheck.statusCode === 200) {
      const allowedOrigin = corsCheck.headers['access-control-allow-origin'];
      if (allowedOrigin === FRONTEND_URL || allowedOrigin === '*') {
        log(`  ✓ CORS is properly configured (allows ${allowedOrigin})`, 'green');
      } else {
        log(`  ✗ CORS misconfigured: allows ${allowedOrigin}, expected ${FRONTEND_URL}`, 'red');
      }
    } else {
      log(`  ✗ CORS preflight failed with status ${corsCheck.statusCode}`, 'red');
    }

    // Test login endpoint
    log('  → Testing login endpoint...', 'yellow');
    const loginTest = await makeRequest(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify({
        email: 'admin@mentorship.com',
        password: 'admin123'
      })
    });
    
    if (loginTest.statusCode === 201 || loginTest.statusCode === 200) {
      log('  ✓ Login endpoint is functional', 'green');
    } else if (loginTest.statusCode === 401) {
      log('  ⚠ Login endpoint accessible but credentials invalid', 'yellow');
    } else {
      log(`  ✗ Login endpoint returned status ${loginTest.statusCode}`, 'red');
    }

  } catch (error) {
    log(`  ✗ Backend check failed: ${error.message}`, 'red');
  }
}

async function checkGitStatus() {
  log('\n📦 Checking Git Status...', 'cyan');
  
  try {
    const { stdout: status } = await execPromise('git status --porcelain');
    if (status.trim()) {
      log('  ⚠ Uncommitted changes detected:', 'yellow');
      console.log(status);
    } else {
      log('  ✓ No uncommitted changes', 'green');
    }

    const { stdout: lastCommit } = await execPromise('git log -1 --oneline');
    log(`  → Last commit: ${lastCommit.trim()}`, 'blue');

  } catch (error) {
    log(`  ✗ Git check failed: ${error.message}`, 'red');
  }
}

async function main() {
  log('🚀 Deployment Verification Script', 'bright');
  log('================================\n', 'bright');
  
  log(`Frontend URL: ${FRONTEND_URL}`, 'blue');
  log(`Backend URL: ${BACKEND_URL}`, 'blue');
  log(`API URL: ${API_URL}`, 'blue');
  
  await checkFrontend();
  await checkBackend();
  await checkGitStatus();
  
  log('\n✨ Verification complete!', 'bright');
  
  // Recommendations
  log('\n📝 Recommendations:', 'cyan');
  log('1. If CORS is misconfigured, update CORS_ORIGIN in Railway environment variables');
  log('2. If frontend changes not visible, clear Vercel cache and redeploy');
  log('3. If emergency fix not loading, check vercel.json and build output');
  log('4. Monitor Railway logs for CORS debugging information');
}

// Run the script
main().catch(error => {
  log(`\n❌ Script failed: ${error.message}`, 'red');
  process.exit(1);
});