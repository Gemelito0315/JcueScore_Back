import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('invoice_item')
export class InvoiceItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    invoiceId: number;

    @ManyToOne(() => Invoice)
    @JoinColumn({ name: 'invoiceId' })
    invoice: Invoice;

    @Column({ type: 'int', nullable: true })
    reservationId: number;

    @ManyToOne(() => Reservation, { nullable: true })
    @JoinColumn({ name: 'reservationId' })
    reservation: Reservation;

    @Column({ type: 'int', nullable: true })
    productId: number;

    @ManyToOne(() => Product, { nullable: true })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'varchar', length: 500 })
    description: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;
}
