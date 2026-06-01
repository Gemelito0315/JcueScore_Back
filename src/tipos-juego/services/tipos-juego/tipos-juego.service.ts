import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameType } from '../../../tipos-juego/entities/game-type.entity';
import {
  CreateTipoJuegoDto,
  UpdateTipoJuegoDto,
} from '../../dtos/tipo-juego.dto';

@Injectable()
export class TiposJuegoService {
  constructor(
    @InjectRepository(GameType)
    private tipoJuegoRepo: Repository<GameType>,
  ) {}

  async findAll() {
    return await this.tipoJuegoRepo.find();
  }

  async findOne(id: number) {
    const tipo = await this.tipoJuegoRepo.findOne({ where: { id } });
    if (!tipo) {
      throw new NotFoundException(`Tipo de juego #${id} no encontrado`);
    }
    return tipo;
  }

  async create(createTipoJuegoDto: CreateTipoJuegoDto) {
    const newTipo = this.tipoJuegoRepo.create(createTipoJuegoDto);
    return await this.tipoJuegoRepo.save(newTipo);
  }

  async update(id: number, updateTipoJuegoDto: UpdateTipoJuegoDto) {
    const tipo = await this.findOne(id);
    this.tipoJuegoRepo.merge(tipo, updateTipoJuegoDto);
    return await this.tipoJuegoRepo.save(tipo);
  }

  async remove(id: number) {
    const tipo = await this.findOne(id);
    return await this.tipoJuegoRepo.remove(tipo);
  }
}
