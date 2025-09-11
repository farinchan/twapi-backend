import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePostDto) {
    return this.prisma.post.create({ data: dto });
  }

  findAll() {
    return this.prisma.post.findMany({ include: { author: true }, orderBy: { id: 'desc' } });
  }

  async publish(id: number, published = true) {
    const post = await this.prisma.post.update({
      where: { id },
      data: { published },
    }).catch(() => null);

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }
}
