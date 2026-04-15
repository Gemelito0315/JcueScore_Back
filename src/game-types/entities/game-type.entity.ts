import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('game_type')
export class GameType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string; // billar, tejo, bolirama

    @Column({ type: 'varchar', length: 500, nullable: true })
    description: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
