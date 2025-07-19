import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Temporary middleware to handle legacy routes without /api prefix
 * This is to support frontend deployments that haven't updated yet
 */
@Injectable()
export class LegacyRoutesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // List of routes that should be redirected to /api
    const legacyRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/profile',
      '/auth/logout',
      '/users',
      '/sessions',
      '/messages',
      '/notifications',
      '/resources',
      '/goals',
      '/analytics',
      '/availability',
      '/feedback',
      '/mentorship-requests'
    ];

    // Check if the current path matches any legacy route
    const matchedRoute = legacyRoutes.find(route => req.path.startsWith(route));
    
    if (matchedRoute) {
      // Log for debugging
      console.log(`Legacy route detected: ${req.path} -> /api${req.path}`);
      
      // Redirect to the correct path with /api prefix
      const newPath = `/api${req.path}`;
      
      // For GET requests, do a redirect
      if (req.method === 'GET') {
        return res.redirect(301, newPath);
      }
      
      // For other methods (POST, PUT, etc), we need to proxy the request
      req.url = newPath;
    }
    
    next();
  }
}