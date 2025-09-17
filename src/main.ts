import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as whatsapp from "wa-multi-session";

class SocketIOAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      path: '/ws',
      cors: {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        allowedHeaders: ['*']
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true,
      pingTimeout: 60000,
      pingInterval: 25000
    });
    return server;
  }
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true // Enable CORS untuk seluruh aplikasi
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('API Nest + Prisma')
    .setDescription('Dokumentasi API (Auth, Users, Posts, dll.)')
    .setVersion('1.0.0')
    .addBearerAuth() // kalau pakai JWT
    // .addServer('http://localhost:3000') // opsional
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true }, // token tetap tersimpan saat reload
    customSiteTitle: 'API Docs',
    customCss: '.swagger-ui .topbar { display: none }', // sembunyikan bar atas
    jsonDocumentUrl: 'docs-json', // endpoint untuk file JSON (default: /api-json)
  });

  // Konfigurasi WebSocket adapter untuk Socket.IO
  app.useWebSocketAdapter(new SocketIOAdapter(app));


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



  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`🔌 Socket.IO server is running on: ws://localhost:${port}/ws`);
}
bootstrap();