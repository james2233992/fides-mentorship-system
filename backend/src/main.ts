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

  // Enable CORS with specific configuration
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  // In production, accept multiple origins if CORS_ORIGIN contains comma-separated values
  let corsOrigin;
  if (isProduction) {
    const corsEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
    if (corsEnv && corsEnv.includes(',')) {
      // Multiple origins
      corsOrigin = corsEnv.split(',').map(origin => origin.trim());
    } else {
      // Single origin or fallback
      corsOrigin = corsEnv || 'https://fides-mentorship-system-t8ey.vercel.app';
    }
  } else {
    corsOrigin = ['http://localhost:3000', 'http://localhost:3001'];
  }
  
  console.log('CORS Configuration:', { corsOrigin });
  
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
