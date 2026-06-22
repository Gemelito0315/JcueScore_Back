import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('configuracion')
  async getConfig() {
    return await this.appService.getConfig();
  }

  @Post('configuracion')
  @UseGuards(JwtAuthGuard)
  async saveConfig(@Body() body: any) {
    return await this.appService.setConfig(body);
  }

  @Put('configuracion')
  @UseGuards(JwtAuthGuard)
  async updateConfig(@Body() body: any) {
    return await this.appService.setConfig(body);
  }

  @Put('configuracion/ubicacion')
  @UseGuards(JwtAuthGuard)
  async updateLocation(@Body() body: { lat: number; lng: number }) {
    const currentConfig = await this.appService.getConfig();
    currentConfig.ubicacion = { lat: body.lat, lng: body.lng };
    return await this.appService.setConfig(currentConfig);
  }
}