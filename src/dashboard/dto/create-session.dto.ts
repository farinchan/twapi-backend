import { IsNotEmpty, IsOptional, IsInt, IsBoolean, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSessionDto {

    @ApiProperty({ example: 'session_name_unique', description: 'Unique name for the session', required: true })
    @IsNotEmpty() @IsString() sessionName: string;

    @ApiProperty({ example: '+6281234567890', description: 'WhatsApp number associated with the session', required: true })
    @IsNotEmpty() @IsString() whatsAppNumber: string;

    @ApiProperty({ example: 'http://localhost:3000/webhook', description: 'Callback URL for session events', required: false })
    @IsOptional() webhookUrl?: string;

    @ApiProperty({ example: true, description: 'Indicates if the session is active', required: false })
    @IsOptional() @IsBoolean() isActive?: boolean;

    @ApiProperty({ example: 1, description: 'User ID associated with the session', required: true })
    @IsNotEmpty()
    @IsInt()
    userId: number;
}