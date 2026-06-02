import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserModel } from '../../users/interfaces/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    // @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async validateUser(email: string, password: string) {
    const user: User = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Tu cuenta de correo no ha sido verificada. Por favor, verifica tu correo antes de iniciar sesión.',
      );
    }

    const { password: _, ...result } = user;
    return result;
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Token de verificación inválido o expirado.');
    }
    user.isEmailVerified = true;
    user.verificationToken = null;
    await this.usersService.updateEmailVerification(user);
  }

  async login(user: UserModel) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.name) || [],
    };

    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // async login(user: UserModel) {
  //     const payload = { sub: user.id, email: user.email };
  //     return {
  //         access_token: this.jwtService.sign(payload),
  //     };
  // }
}
