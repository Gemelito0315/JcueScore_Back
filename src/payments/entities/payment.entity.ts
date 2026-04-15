import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Entity('payment')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    invoiceId: number;

    @ManyToOne(() => Invoice)
    @JoinColumn({ name: 'invoiceId' })
    invoice: Invoice;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: ['cash', 'card', 'transfer', 'qr'], default: 'cash' })
    paymentMethod: string;

    @Column({ type: 'date' })
    paymentDate: Date;

    @Column({ type: 'enum', enum: ['pending', 'completed', 'refunded'], default: 'completed' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;
}
