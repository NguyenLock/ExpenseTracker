import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ExpenseTracker API')
    .setDescription('ExpenseTracker backend API')
    .setVersion('0.1.0')
    .addCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`ExpenseTracker API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}

const ACCESS_TOKEN_COOKIE_NAME = 'access_token';

await bootstrap();
