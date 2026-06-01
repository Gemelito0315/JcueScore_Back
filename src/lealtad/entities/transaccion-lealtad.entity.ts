import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Club } from '../../clubs/entities/club.entity';

export enum TipoTransaccion {
  MINING = 'mining',
  GANANCIA_PARTIDA = 'ganancia_partida',
  PARTICIPACION_PARTIDA = 'participacion_partida',
  GANANCIA_TORNEO = 'ganancia_torneo',
  INSCRIPCION_TORNEO = 'inscripcion_torneo',
  COMPRA_PRODUCTO = 'compra_producto',
  CANJE_RECOMPENSA = 'canje_recompensa',
  BONO_ADMIN = 'bono_admin',
  AJUSTE_SISTEMA = 'ajuste_sistema',
}

export enum FuenteTransaccion {
  GPS_CHECKIN = 'gps_checkin',
  PARTIDA_FINALIZADA = 'partida_finalizada',
  TORNEO_FINALIZADO = 'torneo_finalizado',
  SISTEMA = 'sistema',
  ADMIN = 'admin',
}

@Entity('transacciones_lealtad')
export class TransaccionLealtad {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column({ type: 'int' })
  usuarioId: number;

  @ManyToOne(() => Club, { nullable: true })
  @JoinColumn({ name: 'clubId' })
  club: Club;

  @Column({ type: 'int', nullable: true })
  clubId: number;

  @Column({ type: 'enum', enum: TipoTransaccion })
  tipo: TipoTransaccion;

  @Column({ type: 'enum', enum: FuenteTransaccion })
  fuente: FuenteTransaccion;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoAnterior: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoNuevo: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    partidaId?: number;
    torneoId?: number;
    productoId?: number;
    duracionMinutos?: number;
    ubicacionGPS?: {
      latitud: number;
      longitud: number;
      precision: number;
    };
    ipOrigen?: string;
    dispositivo?: string;
    tipoRecompensa?: string;
  };

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
