import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';
import { ProductType } from './product-type.entity';

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    venueId: number;

    @ManyToOne(() => Venue)
    @JoinColumn({ name: 'venueId' })
    venue: Venue;

    @Column({ type: 'int' })
    productTypeId: number;

    @ManyToOne(() => ProductType)
    @JoinColumn({ name: 'productTypeId' })
    productType: ProductType;

    @Column({ type: 'varchar', length: 255 })
    name: string; // Coca-Cola 350ml, Papas Margarita Limón, etc.

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    sku: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    barcode: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    brand: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    presentation: string; // 350ml, 1L, 50g, etc.

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cost: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'int', default: 0 })
    minStock: number;

    @Column({ type: 'varchar', length: 50, default: 'unidad' })
    unit: string; // unidad, caja, paquete, litro, kg

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    imageUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
