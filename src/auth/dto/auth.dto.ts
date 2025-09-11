import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of the user', required: true })
  @IsEmail() email: string;

  @ApiProperty({ minLength: 6, example: 'rahasia123', description: 'Password of the user', required: true })
  @IsString() @MinLength(6) password: string;

  @ApiPropertyOptional({ example: 'Fajri', description: 'Name of the user', required: false })
  @IsOptional() @IsString() name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email of the user', required: true })
  @IsEmail() email: string;

  @ApiProperty({ minLength: 6, example: 'rahasia123', description: 'Password of the user', required: true })
  @MinLength(6) @IsString() password: string;
}
