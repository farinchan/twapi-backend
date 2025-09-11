import { IsBoolean, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString() title: string;
  @IsString() slug: string;
  @IsString() thumbnail: string;
  @IsString() excerpt: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsInt() authorId: number;
  @IsOptional() @IsDate() createdAt?: Date;
  @IsOptional() @IsDate() updatedAt?: Date;
}
