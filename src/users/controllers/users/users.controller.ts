import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Modules } from '../../../auth/decorators/modules.decorator';
import { ModulesGuard } from '../../../auth/guards/modules.guard.guard';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { UsersService } from '../../../users/services/users/users.service';
import { JwtAuthGuard } from '../../../auth/guards/auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Endpoint público para registro
  @Post('register')
  @ApiOperation({ summary: 'Registro de nuevo usuario' })
  register(@Body() payload: CreateUserDto) {
    return this.usersService.create(payload);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Obtener escalafón de jugadores por ELO' })
  getLeaderboard() {
    return this.usersService.getLeaderboard();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':userId/mine-loyalty')
  @ApiOperation({ summary: 'Recolección de JcueCoins' })
  mineLoyalty(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload: { coins: number; minutes: number },
  ) {
    return this.usersService.mineLoyalty(
      userId,
      payload.coins || 10,
      payload.minutes || 60,
    );
  }

  @ApiBearerAuth()
  @Modules('users')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('names')
  getNames() {
    return this.usersService.getNames();
  }

  @ApiBearerAuth()
  @Modules('users')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Get(':userId')
  getOne(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.findOne(userId);
  }

  @ApiBearerAuth()
  @Modules('users')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Post()
  createUser(@Body() payload: CreateUserDto) {
    return this.usersService.create(payload);
  }

  @ApiBearerAuth()
  @Modules('users')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Put(':userId')
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payloadUpdated: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, payloadUpdated);
  }

  @ApiBearerAuth()
  @Modules('users')
  @UseGuards(JwtAuthGuard, ModulesGuard)
  @Delete(':userId')
  deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.deleteUser(userId);
  }
}
