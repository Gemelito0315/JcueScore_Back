import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint público — cualquiera puede consultar si hay mantenimiento
  @Get('maintenance')
  async getMaintenance() {
    return this.appService.getMaintenance();
  }

  // Solo admin puede activar/desactivar
  @Post('maintenance')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async setMaintenance(@Body() body: { active: boolean; message?: string; estimatedTime?: string }) {
    return this.appService.setMaintenance(body);
  }
}
