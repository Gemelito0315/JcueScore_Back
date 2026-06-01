import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InscripcionTorneo } from './inscripcion-torneo.entity';
import { PartidoTorneo } from './partido-torneo.entity';

export enum FormatoTorneo {
  ROUND_ROBIN = 'round_robin',
  ELIMINACION_DIRECTA = 'eliminacion_directa',
  DOBLE_ELIMINACION = 'doble_eliminacion',
  SUIZO = 'suizo',
}

export enum EstadoTorneo {
  INSCRIPCION = 'inscripcion',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

@Entity('torneos')
export class Torneo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: FormatoTorneo,
    default: FormatoTorneo.ROUND_ROBIN,
  })
  formato: FormatoTorneo;

  @Column({
    type: 'enum',
    enum: EstadoTorneo,
    default: EstadoTorneo.INSCRIPCION,
  })
  estado: EstadoTorneo;

  @Column({ type: 'int', default: 2 })
  minJugadores: number;

  @Column({ type: 'int', default: 32 })
  maxJugadores: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premioTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoInscripcion: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaFin: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaLimiteInscripcion: Date;

  @Column({ type: 'json', nullable: true })
  configuracion: {
    puntosPorVictoria?: number;
    puntosPorEmpate?: number;
    handicapActivo?: boolean;
    rondas?: number;
  };

  @OneToMany(() => InscripcionTorneo, (inscripcion) => inscripcion.torneo)
  inscripciones: InscripcionTorneo[];

  @OneToMany(() => PartidoTorneo, (partido) => partido.torneo)
  partidos: PartidoTorneo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
