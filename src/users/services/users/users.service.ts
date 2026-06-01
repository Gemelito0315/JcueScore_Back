import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../dtos/user.dto';
import { RolesService } from '../../../roles/services/roles.service';
import * as bcrypt from 'bcrypt';
import { Pedido, EstadoPedido } from '../../../pedidos/entities/pedido.entity';

@Injectable()
export class UsersService {
  users: User[] = [];
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private rolesService: RolesService,
    private entityManager: EntityManager,
  ) {}

  async findAll() {
    return await this.userRepo.find({
      where: { isActive: true },
      relations: ['roles'],
    });
  }

  async getNames() {
    const users = await this.userRepo.find({
      where: { isActive: true },
      select: ['id', 'name', 'lastName'],
    });
    return users;
  }

  // async findByEmail(email: string) {
  //     const user = await this.userRepo.findOne({ where: { email: email } });
  //     if (!user) {
  //         throw new NotFoundException(`User ${email} not found`);
  //     }
  //     return user;
  // }

  async findByEmail(email: string) {
    const user = await this.userRepo.findOne({
      where: { email: email.toLowerCase(), isActive: true },
      relations: {
        roles: {
          modules: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }
    return user;
  }

  async findOne(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return user;
  }

  // createUser(payload: CreateUserDto){
  //     const newUser = this.userRepo.create(payload);
  //     return this.userRepo.save(newUser);
  // }

  async create(createUserDto: CreateUserDto) {
    const { roleIds = [], password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const roles = await this.rolesService.findByIds(roleIds);

    if (roleIds.length && roles.length !== roleIds.length) {
      throw new NotFoundException('Some roles were not found');
    }

    const newUser = this.userRepo.create({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      roles,
    });
    return this.userRepo.save(newUser);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { roleIds, password, ...userData } = updateUserDto;

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!user) throw new NotFoundException('User not found');

    // actualizar roles
    if (roleIds) {
      const roles = await this.rolesService.findByIds(roleIds);

      if (roles.length !== roleIds.length) {
        throw new NotFoundException('Some roles were not found');
      }

      user.roles = roles;
    }

    // actualizar password solo si viene
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // actualizar resto de datos
    this.userRepo.merge(user, userData);

    return this.userRepo.save(user);
  }

  // async updateUser(id: number, payloadUpdated: UpdateUserDto) {
  //     const user = await this.userRepo.findOne({ where: { id } });
  //     if (!user) {
  //         throw new NotFoundException(`User #${id} not found`);
  //     }
  //     this.userRepo.merge(user, payloadUpdated);
  // }

  async deleteUser(idUser: number) {
    const user = await this.userRepo.findOne({ where: { id: idUser } });
    if (!user) {
      throw new NotFoundException(`User #${idUser} not found`);
    }
    if (user.email === 'admin@correo.com' || user.email === 'admin@jcuescore.com') {
      throw new BadRequestException(
        'No se puede eliminar el administrador principal.',
      );
    }
    user.isActive = false;
    await this.userRepo.save(user);

    // Cancelar lógicamente todos los pedidos activos/pendientes del usuario lógicamente eliminado
    await this.entityManager.update(
      Pedido,
      { usuarioId: idUser, estado: In([EstadoPedido.PENDIENTE, EstadoPedido.EN_PREPARACION, EstadoPedido.LISTO]) },
      { estado: EstadoPedido.CANCELADO, notas: 'Cancelado automáticamente al eliminar/desactivar el usuario.' }
    );

    return user;
  }

  async getLeaderboard() {
    // Obtenemos a los usuarios ordenados por ELO descendente
    const users = await this.userRepo.find({
      where: { isActive: true },
      order: { eloRating: 'DESC' },
      take: 50,
      relations: ['club'],
    });

    // Calcular winRate real de cada usuario a partir de sus partidas
    const leaderboard = await Promise.all(
      users.map(async (u) => {
        // Partidas donde participó como jugador1 o jugador2 (finalizadas con marcador)
        const partidas = await this.entityManager.query(
          `SELECT marcador, "jugador1Id", "jugador2Id"
           FROM partidas
           WHERE estado = 'finalizada'
             AND marcador IS NOT NULL
             AND ("jugador1Id" = $1 OR "jugador2Id" = $1)`,
          [u.id],
        );

        const totalPartidas = partidas.length;
        let victorias = 0;
        for (const p of partidas) {
          const m = p.marcador;
          if (!m) continue;
          const esJ1 = p.jugador1Id === u.id;
          if (esJ1 && m.j1 > m.j2) victorias++;
          if (!esJ1 && m.j2 > m.j1) victorias++;
        }
        const winRate =
          totalPartidas > 0 ? Math.round((victorias / totalPartidas) * 100) : 0;

        return {
          id: u.id,
          name: `${u.name} ${u.lastName}`,
          elo: u.eloRating,
          winRate,
          club: u.club?.name || 'Sin Club',
          loyaltyPoints: u.loyaltyPoints,
        };
      }),
    );

    return leaderboard;
  }

  async mineLoyalty(userId: number, pointsToAdd: number, minutesToAdd: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User #${userId} not found`);

    user.loyaltyPoints += pointsToAdd;
    user.totalStayTimeMinutes += minutesToAdd;

    return this.userRepo.save(user);
  }
}
