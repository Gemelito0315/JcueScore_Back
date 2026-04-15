import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../../invoices/entities/invoice.entity';
import { CreateFacturaDto, UpdateFacturaDto } from '../../dtos/factura.dto';

@Injectable()
export class FacturasService {
    constructor(
        @InjectRepository(Invoice)
        private facturaRepo: Repository<Invoice>,
    ) {}

    async findAll() {
        return await this.facturaRepo.find({ relations: ['customer', 'venue'] });
    }

    async findOne(id: number) {
        const factura = await this.facturaRepo.findOne({ 
            where: { id },
            relations: ['customer', 'venue']
        });
        if (!factura) {
            throw new NotFoundException(`Factura #${id} no encontrada`);
        }
        return factura;
    }

    async create(createFacturaDto: CreateFacturaDto) {
        const newFactura = this.facturaRepo.create(createFacturaDto);
        return await this.facturaRepo.save(newFactura);
    }

    async update(id: number, updateFacturaDto: UpdateFacturaDto) {
        const factura = await this.findOne(id);
        this.facturaRepo.merge(factura, updateFacturaDto);
        return await this.facturaRepo.save(factura);
    }

    async remove(id: number) {
        const factura = await this.findOne(id);
        return await this.facturaRepo.remove(factura);
    }
}
