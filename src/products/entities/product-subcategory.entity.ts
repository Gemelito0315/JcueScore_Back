import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductCategory } from './product-category.entity';

@Entity('product_subcategory')
export class ProductSubcategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    categoryId: number;

    @ManyToOne(() => ProductCategory)
    @JoinColumn({ name: 'categoryId' })
    category: ProductCategory;

    @Column({ type: 'varchar', length: 255 })
    name: string; // Alcohólicas, No Alcohólicas, Salados, Dulces, etc.

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
