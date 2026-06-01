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

export enum EstadoPartido {
  PENDIENTE = 'pendiente',
  EN_JUEGO = 'en_juego',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

export enum FaseTorneo {
  GRUPOS = 'grupos',
  OCTAVOS = 'octavos',
  CUARTOS = 'cuartos',
  SEMIFINALES = 'semifinales',
  FINAL = 'final',
  TERCER_PUESTO = 'tercer_puesto',
}

@Entity('partidos_torneo')
export class PartidoTorneo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Torneo, (torneo) => torneo.partidos)
  @JoinColumn({ name: 'torneoId' })
  torneo: Torneo;

  @Column({ type: 'int' })
  torneoId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'jugador1Id' })
  jugador1: User;

  @Column({ type: 'int', nullable: true })
  jugador1Id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'jugador2Id' })
  jugador2: User;

  @Column({ type: 'int', nullable: true })
  jugador2Id: number;

  @Column({ type: 'int', nullable: true })
  jugador1Score: number;

  @Column({ type: 'int', nullable: true })
  jugador2Score: number;

  @Column({ type: 'int', nullable: true })
  jugador1Innings: number;

  @Column({ type: 'int', nullable: true })
  jugador2Innings: number;

  @Column({
    type: 'enum',
    enum: EstadoPartido,
    default: EstadoPartido.PENDIENTE,
  })
  estado: EstadoPartido;

  @Column({ type: 'enum', enum: FaseTorneo, default: FaseTorneo.GRUPOS })
  fase: FaseTorneo;

  @Column({ type: 'int', nullable: true })
  numeroRonda: number;

  @Column({ type: 'int', nullable: true })
  numeroGrupo: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaProgramada: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaFin: Date;

  @Column({ type: 'json', nullable: true })
  estadisticas: {
    duracionMinutos?: number;
    promedioJugador1?: number;
    promedioJugador2?: number;
    mejorRacha?: number;
  };

  @Column({ type: 'text', nullable: true })
  mesaAsignada: string;

  @CreateDateColumn()
  createdAt: Date;
}
