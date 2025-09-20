import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class DashboardService {

  findAll() {
    return `This action returns all dashboard`;
  }

  createSession(createSessionDto: CreateSessionDto) {
    return 'This action adds a new session';
  }

  findAllSession() {
    return `This action returns all sessions`;
  }

  findOneSession(id: number) {
    return `This action returns a #${id} session`;
  }

  updateSession(id: number, updateSessionDto: UpdateSessionDto) {
    return `This action updates a #${id} session`;
  }

  removeSession(id: number) {
    return `This action removes a #${id} session`;
  }
}
