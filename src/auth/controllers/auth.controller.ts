import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './../../auth/guards/auth.guard';
import { LoginDto } from '../dtos/login.dto';
import { VerifyDto } from '../dtos/verify.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('verify')
  async verify(@Body() body: VerifyDto) {
    await this.authService.verifyEmail(body.token);
    return { message: 'Cuenta verificada exitosamente.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() body: any) {
    const userId = req.user.sub || req.user.id;
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}

