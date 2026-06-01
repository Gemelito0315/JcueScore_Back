import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../../pagos/entities/payment.entity';
import { CreatePagoDto, UpdatePagoDto } from '../../dtos/pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Payment)
    private pagoRepo: Repository<Payment>,
  ) {}

  async findAll() {
    return await this.pagoRepo.find({ relations: ['invoice'] });
  }

  async findOne(id: number) {
    const pago = await this.pagoRepo.findOne({
      where: { id },
      relations: ['invoice'],
    });
    if (!pago) {
      throw new NotFoundException(`Pago #${id} no encontrado`);
    }
    return pago;
  }

  async create(createPagoDto: CreatePagoDto) {
    const newPago = this.pagoRepo.create(createPagoDto);
    return await this.pagoRepo.save(newPago);
  }

  async update(id: number, updatePagoDto: UpdatePagoDto) {
    const pago = await this.findOne(id);
    this.pagoRepo.merge(pago, updatePagoDto);
    return await this.pagoRepo.save(pago);
  }

  async remove(id: number) {
    const pago = await this.findOne(id);
    return await this.pagoRepo.remove(pago);
  }
}
