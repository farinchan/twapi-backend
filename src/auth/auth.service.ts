import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(private users: UsersService, private jwt: JwtService) { }

    async register(email: string, password: string, name?: string) {
        const user = await this.users.create({
            email, password: await bcrypt.hash(password, 10), name
        });

        const { password: _, ...userWithoutPassword } = user;
        return { 
            statusCode: 201, 
            message: 'User registered successfully', 
            data: {
            ...userWithoutPassword,
            access_token: this.signUser(user.id, user.email, user.role).access_token
            }
        };
    }

    async login(email: string, password: string) {
        const user = await this.users.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        const { password: _, ...userWithoutPassword } = user;
        return {
            statusCode: 200,
            message: 'Login successful',
            data: 
            {
                ...user,
                access_token: this.signUser(user.id, user.email, user.role).access_token
            }
        };
    }

    private signUser(sub: number, email: string, role: string) {
        const payload = { sub, email, role };
        const access_token = this.jwt.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        });
        return { access_token };
    }
}
