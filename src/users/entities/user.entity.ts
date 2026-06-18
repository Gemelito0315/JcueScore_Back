import { Role } from '../../roles/entities/role.entity';
import { Club } from '../../clubs/entities/club.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name;

  @Column({ type: 'varchar', length: 255 })
  lastName;

  @Column({ type: 'varchar', length: 255 })
  docType;

  @Column({ type: 'varchar', length: 255 })
  docNumber;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Datos adicionales según el rol

  @OneToMany(() => Pedido, (pedido) => pedido.usuario)
  pedidos: Pedido[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  email: string; // Se quitó unique para permitir reutilizar emails de usuarios desactivados

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  // ----- ECOSISTEMA COMPETITIVO Y FIDELIDAD -----
  @Column({ type: 'int', default: 1000 })
  eloRating: number;

  @Column({ type: 'int', default: 0 })
  loyaltyPoints: number;

  @Column({ type: 'int', default: 0 })
  totalStayTimeMinutes: number;
  // ----------------------------------------------

  @Column({ type: 'json', nullable: true, default: [] })
  pushSubscriptions: any[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];

  // Relación One-to-Many: Un usuario pertenece a un Club
  @ManyToOne(() => Club, (club) => club.users, { nullable: true })
  club: Club;
}
