import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MinioService } from './minio/minio.service';


@Module({
  imports: [UsersModule, PrismaModule, PostsModule, AuthModule, WhatsappModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService, MinioService],
})
export class AppModule {}
