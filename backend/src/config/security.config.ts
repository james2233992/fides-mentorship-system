export default () => ({
  security: {
    cors: {
      origin: (() => {
        if (process.env.NODE_ENV === 'production') {
          const corsEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
          if (corsEnv && corsEnv.includes(',')) {
            return corsEnv.split(',').map(origin => origin.trim());
          }
          return corsEnv || 'https://fides-mentorship-system-t8ey.vercel.app';
        }
        return ['http://localhost:3000', 'http://localhost:3001'];
      })(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400, // 24 hours
    },
    rateLimit: {
      global: {
        ttl: 60,
        limit: 10,
      },
      auth: {
        login: {
          ttl: 60,
          limit: 5,
        },
        register: {
          ttl: 60,
          limit: 3,
        },
      },
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION || '7d',
    },
    bcrypt: {
      saltRounds: 10,
    },
  },
});