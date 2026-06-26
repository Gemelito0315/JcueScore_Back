import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../sedes/entities/venue.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { PedidoItem } from './pedido-item.entity';

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  EN_PREPARACION = 'en_preparacion',
  LISTO = 'listo',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  NEQUI = 'nequi',
  DAVIPLATA = 'daviplata',
  TARJETA = 'tarjeta',
  JCEUCOINS = 'jcuecoins',
  CUENTA_MESA = 'cuenta_mesa',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  usuarioId: number;

  @ManyToOne(() => User, (user) => user.pedidos)
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column({ type: 'int' })
  venueId: number;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column({ type: 'int', nullable: true })
  recursoId: number;

  @ManyToOne(() => Resource, { nullable: true })
  @JoinColumn({ name: 'recursoId' })
  recurso: Resource;

  @Column({ type: 'enum', enum: EstadoPedido, default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column({ type: 'enum', enum: MetodoPago, nullable: true })
  metodoPago: MetodoPago;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  propina: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pagado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cambio: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'text', nullable: true })
  direccionEntrega: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega: Date;

  @Column({ type: 'int', nullable: true })
  gariteroId: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'gariteroId' })
  garitero: User;

  @Column({ type: 'timestamp', nullable: true })
  fechaPreparacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntregado: Date;

  @Column({ type: 'int', default: 0 })
  tiempoPreparacionMinutos: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    origen: 'mesa' | 'barra' | 'app' | 'telefono' | 'admin';
    prioridad: 'normal' | 'alta' | 'urgente';
    canalNotificacion: 'app' | 'sms' | 'email';
    ubicacionMesa?: string;
    nombreCliente?: string;
  };

  @OneToMany(() => PedidoItem, (item) => item.pedido)
  items: PedidoItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
