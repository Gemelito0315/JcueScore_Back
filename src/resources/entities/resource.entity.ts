import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venue } from '../../sedes/entities/venue.entity';
import { GameType } from '../../tipos-juego/entities/game-type.entity';

@Entity('resource')
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  venueId: number;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column({ type: 'int' })
  gameTypeId: number;

  @ManyToOne(() => GameType)
  @JoinColumn({ name: 'gameTypeId' })
  gameType: GameType;

  @Column({ type: 'varchar', length: 100 })
  code: string; // Código único por sede (Mesa 1, Cancha A, Máquina 3)

  @Column({
    type: 'enum',
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerHour: number;

  @Column({ type: 'json', nullable: true })
  specifications: any; // Datos específicos según el tipo de juego

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
