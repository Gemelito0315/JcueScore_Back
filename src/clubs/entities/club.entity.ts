import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  foundedAt: Date;

  // Relación One-to-Many: Un club tiene muchos usuarios/jugadores
  @OneToMany(() => User, (user) => user.club)
  users: User[];
}
