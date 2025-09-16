# 📚 Prisma + NestJS Integration Guide

Panduan lengkap penggunaan Prisma CLI dan integrasi dengan NestJS framework untuk database management dan ORM operations.

## 📋 Table of Contents

- [Installation](#-installation)
- [NestJS Setup](#-nestjs-setup)
- [Basic Commands](#-basic-commands)
- [Database Operations](#️-database-operations)
- [Schema Management](#-schema-management)
- [Migration Commands](#-migration-commands)
- [NestJS Service Integration](#-nestjs-service-integration)
- [Generate & Deploy](#-generate--deploy)
- [Studio (Database Browser)](#-studio-database-browser)
- [Seed Data](#-seed-data)
- [Environment Management](#-environment-management)
- [NestJS Best Practices](#-nestjs-best-practices)
- [Advanced Commands](#-advanced-commands)
- [Troubleshooting](#-troubleshooting)

## 🚀 Installation

### **NestJS Project Setup**
```bash
# Install NestJS CLI (jika belum ada)
npm install -g @nestjs/cli

# Create new NestJS project
nest new my-nestjs-app
cd my-nestjs-app
```

### **Prisma Installation**
```bash
# Install Prisma dan dependencies
npm install prisma @prisma/client
npm install -D prisma

# Install untuk TypeScript support
npm install -D ts-node typescript @types/node
```

## 🏗️ NestJS Setup

### **Initialize Prisma in NestJS**
```bash
# Setup Prisma di project NestJS
npx prisma init

# Atau dengan provider spesifik
npx prisma init --datasource-provider postgresql
```

### **Create Prisma Module & Service**
```bash
# Generate Prisma module
nest generate module prisma
nest generate service prisma
```

### **Prisma Service Setup**
```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  async onModuleInit() {
    await this.$connect();
    console.log('🔗 Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  // Helper method untuk clean disconnect
  async enableShutdownHooks(app: any) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

### **Prisma Module Configuration**
```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### **Add to App Module**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### **Verify Installation**
```bash
# Jika install global
prisma --version

# Jika install di project (recommended)
npx prisma --version
```

## 🎯 Basic Commands

### **Help & Documentation**
```bash
# Lihat semua commands
npx prisma --help

# Help untuk command spesifik
npx prisma migrate --help
npx prisma db --help
npx prisma generate --help
```

### **Initialize Project**
```bash
# Setup Prisma di project baru
npx prisma init

# Initialize dengan provider spesifik
npx prisma init --datasource-provider postgresql
npx prisma init --datasource-provider mysql
npx prisma init --datasource-provider sqlite
npx prisma init --datasource-provider mongodb
```

## 🗄️ Database Operations

### **Database Connection**
```bash
# Test koneksi database
npx prisma db push

# Reset database (HATI-HATI: menghapus semua data)
npx prisma db reset

# Execute SQL file
npx prisma db execute --file ./script.sql
```

### **Schema Synchronization**
```bash
# Push schema ke database tanpa migration
npx prisma db push

# Pull schema dari database existing
npx prisma db pull
```

### **Database Reset & Seed**
```bash
# Reset database dan run seed
npx prisma db reset

# Reset tanpa konfirmasi (untuk CI/CD)
npx prisma db reset --force

# Skip seed saat reset
npx prisma db reset --skip-seed
```

## 📝 Schema Management

### **Validate Schema**
```bash
# Validasi schema.prisma
npx prisma validate

# Format schema file
npx prisma format
```

### **Generate Client**
```bash
# Generate Prisma Client
npx prisma generate

# Generate dengan custom output
npx prisma generate --generator client

# Watch mode untuk development
npx prisma generate --watch
```

## 🔄 Migration Commands

### **Create Migration**
```bash
# Buat migration baru
npx prisma migrate dev

# Buat migration dengan nama spesifik
npx prisma migrate dev --name add_user_table

# Create migration draft tanpa apply
npx prisma migrate dev --create-only
```

### **Deploy Migration**
```bash
# Deploy migration ke production
npx prisma migrate deploy

# Deploy dengan force (skip checks)
npx prisma migrate deploy --force
```

### **Migration Status**
```bash
# Lihat status migration
npx prisma migrate status

# Reset migration state
npx prisma migrate reset

# Resolve migration conflicts
npx prisma migrate resolve --applied "20231201000000_migration_name"
npx prisma migrate resolve --rolled-back "20231201000000_migration_name"
```

### **Migration Diff**
```bash
# Lihat perubahan schema
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Compare database dengan schema
npx prisma migrate diff \
  --from-url $DATABASE_URL \
  --to-schema-datamodel prisma/schema.prisma
```

## 🏛️ NestJS Service Integration

### **Basic Service with Prisma**
```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
```

### **Controller Integration**
```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: Prisma.UserUpdateInput) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

### **DTO with Prisma Types**
```typescript
// src/users/dto/create-user.dto.ts
import { Prisma } from '@prisma/client';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

### **Relations Handling**
```typescript
// src/posts/posts.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
      include: {
        author: true, // Include author relation
      },
    });
  }

  async getPostsByUser(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getPostsWithAuthor() {
    return this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
```

## 🎨 Generate & Deploy

### **Generate Prisma Client**
```bash
# Generate client
npx prisma generate

# Generate dengan custom binary
npx prisma generate --data-proxy

# Generate untuk different platform
npx prisma generate --generator client --no-engine
```

### **Deploy to Production**
```bash
# Production deployment workflow
npx prisma migrate deploy
npx prisma generate
```

## 🎯 Studio (Database Browser)

### **Launch Prisma Studio**
```bash
# Buka Prisma Studio (Web UI)
npx prisma studio

# Studio dengan port custom
npx prisma studio --port 5000

# Studio dengan browser spesifik
npx prisma studio --browser firefox
```

### **Studio Features**
- 🔍 Browse data
- ✏️ Edit records
- 🔗 Follow relations
- 📊 Query data
- 🎨 Visual schema explorer

## 🌱 Seed Data

### **Create Seed File for NestJS**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash password untuk user
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Seed users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      bio: 'System Administrator'
    }
  })

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      bio: 'Content Creator'
    }
  })

  // Seed posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with NestJS',
        content: 'NestJS is a progressive Node.js framework...',
        published: true,
        authorId: admin.id
      },
      {
        title: 'Prisma Integration',
        content: 'Learn how to integrate Prisma with NestJS...',
        published: true,
        authorId: user1.id
      },
      {
        title: 'Draft Post',
        content: 'This is a draft post...',
        published: false,
        authorId: user1.id
      }
    ]
  })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### **Configure Seed in package.json**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma db reset",
    "db:migrate": "npx prisma migrate dev",
    "db:studio": "npx prisma studio"
  }
}
```

### **Run Seed**
```bash
# Run seed
npm run db:seed

# Atau langsung dengan prisma
npx prisma db seed

# Reset database dan run seed
npm run db:reset
```

## 🌍 Environment Management

### **Environment Variables untuk NestJS**
```bash
# .env file
DATABASE_URL="postgresql://username:password@localhost:5432/nestjs_db"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/shadow_db"

# NestJS specific
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-key

# Multiple environments
DATABASE_URL_DEV="postgresql://localhost:5432/nestjs_dev"
DATABASE_URL_TEST="postgresql://localhost:5432/nestjs_test"
DATABASE_URL_PROD="postgresql://localhost:5432/nestjs_prod"
```

### **Environment Configuration Service**
```typescript
// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  shadowUrl: process.env.SHADOW_DATABASE_URL,
}));
```

### **ConfigModule Setup**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // other modules...
  ],
})
export class AppModule {}
```

### **Environment-specific Commands**
```bash
# Development
NODE_ENV=development npx prisma migrate dev

# Testing
NODE_ENV=test DATABASE_URL=$DATABASE_URL_TEST npx prisma db push

# Production
NODE_ENV=production DATABASE_URL=$DATABASE_URL_PROD npx prisma migrate deploy
```

## 🎯 NestJS Best Practices

### **Error Handling dengan Prisma**
```typescript
// src/common/exceptions/prisma.exception.ts
import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002':
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'Unique constraint violation',
          error: 'Conflict',
        });
        break;
      case 'P2025':
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        });
        break;
      default:
        super.catch(exception, host);
        break;
    }
  }
}
```

### **Transaction dengan NestJS**
```typescript
// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUserWithProfile(userData: any, profileData: any) {
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: userData,
      });

      const profile = await prisma.profile.create({
        data: {
          ...profileData,
          userId: user.id,
        },
      });

      return { user, profile };
    });
  }
}
```

### **Middleware untuk Logging**
```typescript
// src/common/middleware/prisma-logging.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PrismaLoggingMiddleware implements NestMiddleware {
  private logger = new Logger('PrismaQuery');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
  }
}
```

### **Custom Decorators**
```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Usage in controller
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return this.usersService.findOne(user.id);
}
```

### **Validation dengan Class Validator**
```typescript
// src/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

## 🔧 Advanced Commands

### **Introspection**
```bash
# Pull existing database schema
npx prisma db pull

# Pull dengan force overwrite
npx prisma db pull --force

# Pull dengan print SQL
npx prisma db pull --print
```

### **Debug & Logging**
```bash
# Debug mode
DEBUG=prisma:* npx prisma migrate dev

# Prisma query logging
npx prisma studio --experimental

# Generate with debug
npx prisma generate --debug
```

### **Platform-specific**
```bash
# Generate for specific platform
npx prisma generate --target native
npx prisma generate --target debian-openssl-1.1.x
npx prisma generate --target windows
npx prisma generate --target darwin
```

## 🔧 Common Workflows

### **Development Workflow**
```bash
# 1. Ubah schema prisma/schema.prisma
# 2. Generate migration
npx prisma migrate dev --name describe_your_changes

# 3. Generate client (otomatis dengan migrate dev)
# npx prisma generate

# 4. Update NestJS services dengan new types
# 5. Test di Studio
npx prisma studio
```

### **Production Deployment untuk NestJS**
```bash
# 1. Build NestJS application
npm run build

# 2. Deploy migrations
npx prisma migrate deploy

# 3. Generate client
npx prisma generate

# 4. Start application
npm run start:prod
```

### **Team Collaboration dengan NestJS**
```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies
npm install

# 3. Apply migrations locally
npx prisma migrate dev

# 4. Generate client
npx prisma generate

# 5. Start development server
npm run start:dev
```

## 🆘 Troubleshooting

### **Common Issues**

#### **Migration Conflicts**
```bash
# Reset migration state
npx prisma migrate reset

# Mark migration as applied
npx prisma migrate resolve --applied "migration_name"

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back "migration_name"
```

#### **Database Connection Issues**
```bash
# Test connection
npx prisma db push --accept-data-loss

# Check DATABASE_URL format
echo $DATABASE_URL
```

#### **Client Generation Issues**
```bash
# Clear generated client
rm -rf node_modules/.prisma

# Regenerate
npx prisma generate

# Clear cache
rm -rf node_modules/@prisma/client
npm install @prisma/client
```

#### **Schema Validation Errors**
```bash
# Validate schema
prisma validate

# Format schema
prisma format

# Check for syntax errors
npx tsc --noEmit prisma/schema.prisma
```

### **Performance Tips**

#### **Query Optimization**
```typescript
// Use select untuk field tertentu
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true
  }
})

// Use include untuk relations
const usersWithPosts = await prisma.user.findMany({
  include: {
    posts: true
  }
})

// Pagination
const users = await prisma.user.findMany({
  skip: 10,
  take: 20
})
```

#### **Connection Pool**
```typescript
// Configure connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
})
```

### **Debugging Queries**
```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})
```

## 📚 Additional Resources

- [Official Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Database Connector Reference](https://www.prisma.io/docs/reference/database-reference)
- [Migration Guide](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

## 🤝 Contributing

Jika ada perintah atau tip yang hilang, silakan buat issue atau pull request!

---

**Happy coding with Prisma + NestJS! 🚀**
