import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductSubcategory } from './product-subcategory.entity';

@Entity('product_type')
export class ProductType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    subcategoryId: number;

    @ManyToOne(() => ProductSubcategory)
    @JoinColumn({ name: 'subcategoryId' })
    subcategory: ProductSubcategory;

    @Column({ type: 'varchar', length: 255 })
    name: string; // Cervezas, Gaseosas, Papas, Chocolates, etc.

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
