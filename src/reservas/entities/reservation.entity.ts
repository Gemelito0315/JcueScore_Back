import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../clientes/entities/customer.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { Venue } from '../../sedes/entities/venue.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  customerId: number;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guestName: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  resourceId: number;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ type: 'int' })
  venueId: number;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @Column({ type: 'date' })
  reservationDate: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'partial', 'paid'],
    default: 'pending',
  })
  paymentStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
