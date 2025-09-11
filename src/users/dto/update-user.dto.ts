import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export enum UserRole {
    Admin = 'Admin',
    Moderator = 'Moderator',
    User = 'User'
}
export class UpdateUserDto {


    @ApiProperty({ example: 'user@example.com', description: 'Email of the user', required: false })
    @IsOptional() @IsEmail() email?: string;

    @ApiProperty({ example: 'Fajri', description: 'Name of the user', required: false })
    @IsOptional() @IsString() name?: string;

    @ApiProperty({ example: 'rahasia123', description: 'Password of the user', required: false })
    @IsOptional() @IsString() password?: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar image URL of the user', required: false })
    @IsOptional() @IsString() image?: string;

    @ApiProperty({ example: 'user', description: 'Role of the user', required: false, enum: UserRole })
    @IsOptional() @IsString() role?: UserRole;
}
