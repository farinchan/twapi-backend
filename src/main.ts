import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as whatsapp from "wa-multi-session";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('API Nest + Prisma')
    .setDescription('Dokumentasi API (Auth, Users, Posts, dll.)')
    .setVersion('1.0.0')
    .addBearerAuth() // kalau pakai JWT
    .addServer('http://localhost:3000') // opsional
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // token tetap tersimpan saat reload
    customSiteTitle: 'API Docs',
    customCss: '.swagger-ui .topbar { display: none }', // sembunyikan bar atas
    jsonDocumentUrl: 'docs-json', // endpoint untuk file JSON (default: /api-json)
  });

  whatsapp.onConnected((session) => {
    console.log("connected => ", session);
  });


  whatsapp.onDisconnected((session) => {
    console.log("disconnected => ", session);
  });

  whatsapp.onConnecting((session) => {
    console.log("connecting => ", session);
  });

  whatsapp.loadSessionsFromStorage();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
