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
import { Resource } from '../../resources/entities/resource.entity';

@Entity('equipment')
export class Equipment {
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

  @Column({ type: 'int', nullable: true })
  resourceId: number;

  @ManyToOne(() => Resource, { nullable: true })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ type: 'varchar', length: 255 })
  name: string; // taco, bola, tejo, mecha, etc

  @Column({ type: 'varchar', length: 100, nullable: true })
  code: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  minStock: number;

  @Column({
    type: 'enum',
    enum: ['available', 'in-use', 'damaged', 'maintenance'],
    default: 'available',
  })
  status: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
