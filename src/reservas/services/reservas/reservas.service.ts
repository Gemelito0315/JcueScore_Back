import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../../../reservations/entities/reservation.entity';
import { CreateReservaDto, UpdateReservaDto } from '../../dtos/reserva.dto';

@Injectable()
export class ReservasService {
    constructor(
        @InjectRepository(Reservation)
        private reservaRepo: Repository<Reservation>,
    ) {}

    async findAll() {
        return await this.reservaRepo.find({ 
            relations: ['customer', 'resource', 'venue'] 
        });
    }

    async findOne(id: number) {
        const reserva = await this.reservaRepo.findOne({ 
            where: { id },
            relations: ['customer', 'resource', 'venue']
        });
        if (!reserva) {
            throw new NotFoundException(`Reserva #${id} no encontrada`);
        }
        return reserva;
    }

    async create(createReservaDto: CreateReservaDto) {
        const newReserva = this.reservaRepo.create(createReservaDto);
        return await this.reservaRepo.save(newReserva);
    }

    async update(id: number, updateReservaDto: UpdateReservaDto) {
        const reserva = await this.findOne(id);
        this.reservaRepo.merge(reserva, updateReservaDto);
        return await this.reservaRepo.save(reserva);
    }

    async remove(id: number) {
        const reserva = await this.findOne(id);
        return await this.reservaRepo.remove(reserva);
    }
}
