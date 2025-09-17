import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResult } from './dto/paginated-result.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiCreatedResponse({ description: 'User created successfully' })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOkResponse({ description: 'List of users with pagination' })
  // @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedResult<any>> {
    const skipNum = skip ? Number(skip) : 0;
    const takeNum = take ? Number(take) : 10;
    
    return this.usersService.findAll({
      skip: skipNum,
      take: takeNum,
      search: search || undefined,
    });
  }

  @ApiOkResponse({ description: 'User details' })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @ApiOkResponse({ description: 'User updated successfully' })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  @ApiOkResponse({ description: 'User deleted successfully' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
