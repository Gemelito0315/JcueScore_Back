import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../../../equipamiento/entities/equipment.entity';
import {
  CreateEquipamientoDto,
  UpdateEquipamientoDto,
} from '../../dtos/equipamiento.dto';

@Injectable()
export class EquipamientoService {
  constructor(
    @InjectRepository(Equipment)
    private equipamientoRepo: Repository<Equipment>,
  ) {}

  async findAll() {
    return await this.equipamientoRepo.find({
      relations: ['venue', 'gameType', 'resource'],
    });
  }

  async findOne(id: number) {
    const equipamiento = await this.equipamientoRepo.findOne({
      where: { id },
      relations: ['venue', 'gameType', 'resource'],
    });
    if (!equipamiento) {
      throw new NotFoundException(`Equipamiento #${id} no encontrado`);
    }
    return equipamiento;
  }

  async create(createEquipamientoDto: CreateEquipamientoDto) {
    const newEquipamiento = this.equipamientoRepo.create(createEquipamientoDto);
    return await this.equipamientoRepo.save(newEquipamiento);
  }

  async update(id: number, updateEquipamientoDto: UpdateEquipamientoDto) {
    const equipamiento = await this.findOne(id);
    this.equipamientoRepo.merge(equipamiento, updateEquipamientoDto);
    return await this.equipamientoRepo.save(equipamiento);
  }

  async remove(id: number) {
    const equipamiento = await this.findOne(id);
    return await this.equipamientoRepo.remove(equipamiento);
  }
}
