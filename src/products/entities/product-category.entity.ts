import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_category')
export class ProductCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    name: string; // Bebidas, Snacks, Comidas, Complementos

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
