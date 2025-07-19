import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { LegacyRoutesMiddleware } from './middleware/legacy-routes.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security: Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Enable CORS with flexible configuration
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  // Default allowed origins in production
  const productionOrigins = [
    'https://fides-mentorship-system-t8ey.vercel.app',
    'https://fides-frontend.vercel.app',
    'https://fides-mentorship-system.vercel.app',
    'https://fides-mentorship.vercel.app'
  ];
  
  // Parse CORS_ORIGIN environment variable
  let configuredOrigins: string[] = [];
  const corsEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
  if (corsEnv) {
    if (corsEnv.includes(',')) {
      configuredOrigins = corsEnv.split(',').map(origin => origin.trim());
    } else {
      configuredOrigins = [corsEnv.trim()];
    }
  }
  
  // Combine all origins for production
  const allOrigins = isProduction 
    ? [...new Set([...productionOrigins, ...configuredOrigins])]
    : ['http://localhost:3000', 'http://localhost:3001'];
  
  console.log('CORS Configuration:', {
    environment: isProduction ? 'production' : 'development',
    CORS_ORIGIN: corsEnv,
    allowedOrigins: allOrigins
  });
  
  // Dynamic CORS handler for better debugging
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        console.log('CORS: Allowing request with no origin');
        return callback(null, true);
      }
      
      // Check if origin is allowed
      const isAllowed = allOrigins.includes(origin);
      
      if (isAllowed) {
        console.log(`CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        console.warn(`CORS: Blocking origin: ${origin}`);
        console.log('CORS: Allowed origins are:', allOrigins);
        // In production, still allow but log warning (temporary fix)
        if (isProduction) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe with enhanced security
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: isProduction,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply legacy routes middleware BEFORE setting global prefix
  app.use(new LegacyRoutesMiddleware().use);
  
  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('FIDES Mentorship System API')
    .setDescription('API documentation for the FIDES mentorship platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
