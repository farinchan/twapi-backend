import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService, private users: UsersService) { }

    @ApiCreatedResponse({ description: 'User registered & JWT issued' })
    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto.email, dto.password, dto.name);
    }

    @ApiOkResponse({ description: 'JWT issued' })
    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto.email, dto.password);
    }

    @ApiBearerAuth()
    @ApiOkResponse({ description: 'User profile retrieved successfully' })
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async profile(@Req() req: any) {
        // req.user = payload jwt (sub, email, role)
        return this.users.findSafeById(req.user.sub);
    }
}
