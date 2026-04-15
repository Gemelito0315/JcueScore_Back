import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '../../../venues/entities/venue.entity';
import { CreateSedeDto, UpdateSedeDto } from '../../dtos/sede.dto';

@Injectable()
export class SedesService {
    constructor(
        @InjectRepository(Venue)
        private sedeRepo: Repository<Venue>,
    ) {}

    async findAll() {
        return await this.sedeRepo.find();
    }

    async findOne(id: number) {
        const sede = await this.sedeRepo.findOne({ where: { id } });
        if (!sede) {
            throw new NotFoundException(`Sede #${id} no encontrada`);
        }
        return sede;
    }

    async create(createSedeDto: CreateSedeDto) {
        const newSede = this.sedeRepo.create(createSedeDto);
        return await this.sedeRepo.save(newSede);
    }

    async update(id: number, updateSedeDto: UpdateSedeDto) {
        const sede = await this.findOne(id);
        this.sedeRepo.merge(sede, updateSedeDto);
        return await this.sedeRepo.save(sede);
    }

    async remove(id: number) {
        const sede = await this.findOne(id);
        return await this.sedeRepo.remove(sede);
    }
}
