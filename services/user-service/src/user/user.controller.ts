import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@shared/types';
import { CacheInterceptor, Cacheable, CACHE_TTL } from '@shared/common/cache';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SYSTEM_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SYSTEM_ADMIN)
  @Cacheable({ ttl: CACHE_TTL.USER, key: 'users:list' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Cacheable({ ttl: CACHE_TTL.USER, key: 'user' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SYSTEM_ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SYSTEM_ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

