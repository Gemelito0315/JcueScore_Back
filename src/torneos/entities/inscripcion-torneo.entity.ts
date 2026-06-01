import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Torneo } from './torneo.entity';
import { User } from '../../users/entities/user.entity';

export enum EstadoInscripcion {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  ELIMINADA = 'eliminada',
}

@Entity('inscripciones_torneo')
export class InscripcionTorneo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.inscripciones)
  @JoinColumn({ name: 'torneoId' })
  torneo: Torneo;

  @Column({ type: 'int' })
  torneoId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'jugadorId' })
  jugador: User;

  @Column({ type: 'int' })
  jugadorId: number;

  @Column({
    type: 'enum',
    enum: EstadoInscripcion,
    default: EstadoInscripcion.PENDIENTE,
  })
  estado: EstadoInscripcion;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  handicap: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pagoInscripcion: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaPago: Date;

  @Column({ type: 'json', nullable: true })
  estadisticasTorneo: {
    partidosJugados?: number;
    partidosGanados?: number;
    partidosPerdidos?: number;
    puntos?: number;
    promedioGeneral?: number;
  };

  @CreateDateColumn()
  createdAt: Date;
}
