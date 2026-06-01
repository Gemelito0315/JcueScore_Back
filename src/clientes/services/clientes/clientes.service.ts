import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../../clientes/entities/customer.entity';
import { CreateClienteDto, UpdateClienteDto } from '../../dtos/cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Customer)
    private clienteRepo: Repository<Customer>,
  ) {}

  async findAll() {
    return await this.clienteRepo.find();
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepo.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente #${id} no encontrado`);
    }
    return cliente;
  }

  async create(createClienteDto: CreateClienteDto) {
    const newCliente = this.clienteRepo.create(createClienteDto);
    return await this.clienteRepo.save(newCliente);
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    this.clienteRepo.merge(cliente, updateClienteDto);
    return await this.clienteRepo.save(cliente);
  }

  async remove(id: number) {
    const cliente = await this.findOne(id);
    return await this.clienteRepo.remove(cliente);
  }
}
