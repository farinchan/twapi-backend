import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get("sessions")
  findAllSession() {
    return this.dashboardService.findAllSession();
  }

  @Post("sessions")
  createSession(@Body() createSessionDto: CreateSessionDto) {
    return this.dashboardService.createSession(createSessionDto);
  }

  @Get('sessions/:id')
  findOneSession(@Param('id') id: string) {
    return this.dashboardService.findOneSession(+id);
  }

  @Patch('sessions/:id')
  updateSession(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
    return this.dashboardService.updateSession(+id, updateSessionDto);
  }

  @Delete('sessions/:id')
  removeSession(@Param('id') id: string) {
    return this.dashboardService.removeSession(+id);
  }
}
