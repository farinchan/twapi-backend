import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResult, FindAllParams } from './dto/paginated-result.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(params?: FindAllParams): Promise<PaginatedResult<any>> {
    try {
      const { skip = 0, take = 10, cursor, search } = params || {};

      const whereCondition = search
        ? {
          OR: [
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        }
        : undefined;

      // Get total count for pagination
      const total = await this.prisma.user.count({
        where: whereCondition
      });

      // Get paginated data
      const data = await this.prisma.user.findMany({
        skip,
        take,
        cursor,
        where: whereCondition,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password from results
        }
      });

      // Calculate pagination meta
      const page = Math.floor(skip / take) + 1;
      const totalPages = Math.ceil(total / take);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        meta: {
          total,
          page,
          limit: take,
          totalPages,
          hasNext,
          hasPrev
        }
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          // Exclude password from results
        }
      });
      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // untuk profile tanpa field password
  async findSafeById(id: number) {
    const { password, ...rest } = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return rest;
  }

  async update(id: number, data: UpdateUserDto) {
    try {
      await this.findOne(id);
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          // Exclude password from results
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
