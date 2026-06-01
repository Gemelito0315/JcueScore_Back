import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Product } from '../../productos/entities/product.entity';

@Entity('pedido_items')
export class PedidoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  pedidoId: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.items)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'json', nullable: true })
  personalizaciones: {
    sinHielo?: boolean;
    extraAzucar?: boolean;
    tipoLeche?: string;
    temperatura?: 'frio' | 'caliente' | 'ambiente';
    adicionales?: Array<{
      nombre: string;
      precio: number;
    }>;
  };

  @Column({ type: 'boolean', default: false })
  preparado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaPreparado: Date;

  @CreateDateColumn()
  createdAt: Date;
}
