import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservation } from '../../../reservas/entities/reservation.entity';
import { CreateReservaDto, UpdateReservaDto } from '../../dtos/reserva.dto';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reservation)
    private reservaRepo: Repository<Reservation>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.reservaRepo.find({
      relations: ['customer', 'resource', 'resource.gameType', 'venue'],
    });
  }

  async findOne(id: number) {
    const reserva = await this.reservaRepo.findOne({
      where: { id },
      relations: ['customer', 'resource', 'resource.gameType', 'venue'],
    });
    if (!reserva) {
      throw new NotFoundException(`Reserva #${id} no encontrada`);
    }
    return reserva;
  }

  async create(createReservaDto: CreateReservaDto) {
    await this.validateWorkingHours(createReservaDto.startTime, createReservaDto.endTime);
    const newReserva = this.reservaRepo.create(createReservaDto);
    return await this.reservaRepo.save(newReserva);
  }

  async update(id: number, updateReservaDto: UpdateReservaDto) {
    const reserva = await this.findOne(id);
    const updatedStartTime = updateReservaDto.startTime || reserva.startTime;
    const updatedEndTime = updateReservaDto.endTime || reserva.endTime;
    await this.validateWorkingHours(updatedStartTime, updatedEndTime);

    this.reservaRepo.merge(reserva, updateReservaDto);
    return await this.reservaRepo.save(reserva);
  }

  private async validateWorkingHours(startTime: string, endTime: string) {
    if (!startTime || !endTime) return;

    // 1. Obtener la configuración activa de horario de la base de datos
    let horarioApertura = '08:00';
    let horarioCierre = '22:00';
    try {
      const rows = await this.dataSource.query(
        `SELECT value FROM app_settings WHERE key = 'configuracion'`,
      );
      if (rows.length) {
        const config = JSON.parse(rows[0].value);
        if (config.horarioApertura) horarioApertura = config.horarioApertura;
        if (config.horarioCierre) horarioCierre = config.horarioCierre;
      }
    } catch (e) {
      console.error('Error loading config for reservation validation:', e.message);
    }

    const normalizeTime = (t: string): string => {
      if (!t) return '';
      const parts = t.split(':');
      if (parts[0].length === 1) {
        parts[0] = '0' + parts[0];
      }
      return `${parts[0]}:${parts[1]}`.substring(0, 5);
    };

    const startNorm = normalizeTime(startTime);
    const endNorm = normalizeTime(endTime);
    const openNorm = normalizeTime(horarioApertura);
    const closeNorm = normalizeTime(horarioCierre);

    if (startNorm < openNorm) {
      throw new BadRequestException(
        `La hora de inicio (${startNorm}) no puede ser anterior a la hora de apertura (${openNorm}).`,
      );
    }
    if (endNorm > closeNorm) {
      throw new BadRequestException(
        `La hora de fin (${endNorm}) no puede ser posterior a la hora de cierre (${closeNorm}).`,
      );
    }
    if (startNorm >= endNorm) {
      throw new BadRequestException(
        `La hora de fin (${endNorm}) debe ser posterior a la hora de inicio (${startNorm}).`,
      );
    }
  }

  async remove(id: number) {
    const reserva = await this.findOne(id);
    return await this.reservaRepo.remove(reserva);
  }
}
