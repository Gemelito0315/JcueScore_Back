import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../../../resources/entities/resource.entity';
import { CreateRecursoDto, UpdateRecursoDto } from '../../dtos/recurso.dto';
import { Partida } from '../../../partidas/entities/partida.entity';

@Injectable()
export class RecursosService {
  constructor(
    @InjectRepository(Resource)
    private recursoRepo: Repository<Resource>,
    @InjectRepository(Partida)
    private partidaRepo: Repository<Partida>,
  ) {}

  async findAll() {
    return await this.recursoRepo.find({
      where: { isActive: true },
      relations: ['venue', 'gameType'],
    });
  }

  async findOne(id: number) {
    const recurso = await this.recursoRepo.findOne({
      where: { id },
      relations: ['venue', 'gameType'],
    });
    if (!recurso) {
      throw new NotFoundException(`Recurso #${id} no encontrado`);
    }
    return recurso;
  }

  async create(createRecursoDto: CreateRecursoDto) {
    const newRecurso = this.recursoRepo.create(createRecursoDto);
    return await this.recursoRepo.save(newRecurso);
  }

  async update(id: number, updateRecursoDto: UpdateRecursoDto) {
    const recurso = await this.findOne(id);
    this.recursoRepo.merge(recurso, updateRecursoDto);
    return await this.recursoRepo.save(recurso);
  }

  async remove(id: number) {
    const recurso = await this.findOne(id);
    recurso.isActive = false;
    return await this.recursoRepo.save(recurso);
  }

  async findActiveTables() {
    // Obtener todos los recursos y sus partidas activas
    const recursos = await this.recursoRepo.find({
      where: { isActive: true },
      relations: ['venue', 'gameType'],
    });

    const partidasActivas = await this.partidaRepo.find({
      where: { estado: 'en_juego' },
      relations: ['jugador1', 'jugador2', 'recurso'],
    });

    // Solo retornar mesas que tienen partida activa en curso
    const mesasOcupadas = recursos
      .map((recurso) => {
        const partidaActiva = partidasActivas.find(
          (p) => p.recursoId === recurso.id,
        );

        if (partidaActiva) {
          return {
            id: recurso.id,
            code: recurso.code,
            gameType: recurso.gameType?.name || 'Billar',
            status: 'occupied',
            pricePerHour: recurso.pricePerHour,
            resourceId: recurso.id,
            venueId: recurso.venueId,
            tiempoInicio: partidaActiva.horaInicio,
            jugadores: [
              partidaActiva.jugador1?.name
                ? `${partidaActiva.jugador1.name} ${partidaActiva.jugador1.lastName || ''}`.trim()
                : partidaActiva.jugador1NombreOcasional || 'Jugador 1',
              partidaActiva.jugador2?.name
                ? `${partidaActiva.jugador2.name} ${partidaActiva.jugador2.lastName || ''}`.trim()
                : partidaActiva.jugador2NombreOcasional || null,
            ].filter(Boolean),
            marcador: partidaActiva.marcador || { j1: 0, j2: 0 },
            partidaId: partidaActiva.id,
          };
        }
        return null;
      })
      .filter(Boolean);

    return mesasOcupadas;
  }

  async getAllTablesStatus() {
    // Todas las mesas con su estado real (para el panel de mesas del garitero)
    const recursos = await this.recursoRepo.find({
      where: { isActive: true },
      relations: ['venue', 'gameType'],
    });

    const partidasActivas = await this.partidaRepo.find({
      where: { estado: 'en_juego' },
      relations: ['jugador1', 'jugador2'],
    });

    return recursos.map((recurso) => {
      const partidaActiva = partidasActivas.find(
        (p) => p.recursoId === recurso.id,
      );

      const base = {
        id: recurso.id,
        code: recurso.code,
        gameType: recurso.gameType?.name || 'Billar',
        pricePerHour: recurso.pricePerHour,
        resourceId: recurso.id,
        venueId: recurso.venueId,
      };

      if (partidaActiva) {
        return {
          ...base,
          status: 'occupied',
          tiempoInicio: partidaActiva.horaInicio,
          jugadores: [
            partidaActiva.jugador1?.name
              ? `${partidaActiva.jugador1.name} ${partidaActiva.jugador1.lastName || ''}`.trim()
              : partidaActiva.jugador1NombreOcasional || 'Jugador 1',
            partidaActiva.jugador2?.name
              ? `${partidaActiva.jugador2.name} ${partidaActiva.jugador2.lastName || ''}`.trim()
              : partidaActiva.jugador2NombreOcasional || null,
          ].filter(Boolean),
          jugadoresIds: [
            partidaActiva.jugador1?.id,
            partidaActiva.jugador2?.id,
          ].filter(Boolean),
          marcador: partidaActiva.marcador || { j1: 0, j2: 0 },
          partidaId: partidaActiva.id,
        };
      }

      return {
        ...base,
        status: recurso.status || 'available',
        tiempoInicio: null,
        jugadores: [],
        marcador: null,
        partidaId: null,
      };
    });
  }
}
