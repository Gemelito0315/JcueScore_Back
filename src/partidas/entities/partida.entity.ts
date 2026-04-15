import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Resource } from '../../resources/entities/resource.entity';
import { User } from '../../users/entities/user.entity';

export interface Marcador {
  j1: number;
  j2: number;
}

@Entity('partidas')
export class Partida {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Resource, recurso => recurso.id)
  @JoinColumn({ name: 'recursoId' })
  recurso: Resource;

  @Column({ type: 'int' })
  recursoId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'jugador1Id' })
  jugador1: User;

  @Column({ type: 'int' })
  jugador1Id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'jugador2Id' })
  jugador2: User;

  @Column({ type: 'int', nullable: true })
  jugador2Id: number;

  @Column({ type: 'jsonb', nullable: true })
  marcador: Marcador;

  @Column({ type: 'enum', enum: ['iniciada', 'en_juego', 'finalizada', 'pausada'], default: 'iniciada' })
  estado: string;

  @Column({ type: 'timestamp' })
  horaInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  horaFin: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoTotal: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
