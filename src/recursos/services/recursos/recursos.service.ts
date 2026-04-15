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
        return await this.recursoRepo.find({ relations: ['venue', 'gameType'] });
    }

    async findOne(id: number) {
        const recurso = await this.recursoRepo.findOne({ 
            where: { id },
            relations: ['venue', 'gameType']
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
        return await this.recursoRepo.remove(recurso);
    }

    async findActiveTables() {
        // Obtener todos los recursos y sus partidas activas
        const recursos = await this.recursoRepo.find({
            relations: ['venue', 'gameType']
        });

        const partidasActivas = await this.partidaRepo.find({
            where: { estado: 'en_juego' },
            relations: ['jugador1', 'jugador2', 'recurso']
        });

        // Combinar datos para vista en tiempo real con datos de demo
        return recursos.map(recurso => {
            const partidaActiva = partidasActivas.find(p => p.recursoId === recurso.id);
            
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
                        partidaActiva.jugador1?.name || 'Jugador 1',
                        partidaActiva.jugador2?.name || 'Jugador 2'
                    ].filter(Boolean),
                    marcador: partidaActiva.marcador || { j1: 0, j2: 0 },
                    partidaId: partidaActiva.id
                };
            } else {
                // Estado aleatorio para demo (70% disponible, 20% ocupado, 10% mantenimiento)
                const random = Math.random();
                let status = 'available';
                let tiempoInicio, jugadores, marcador;

                if (random < 0.2) {
                    status = 'occupied';
                    tiempoInicio = new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000); // Hasta 2 horas atrás
                    jugadores = ['Carlos R.', 'Andrés M.'];
                    marcador = { j1: Math.floor(Math.random() * 50), j2: Math.floor(Math.random() * 50) };
                } else if (random < 0.1) {
                    status = 'maintenance';
                }

                return {
                    id: recurso.id,
                    code: recurso.code,
                    gameType: recurso.gameType?.name || 'Billar',
                    status,
                    pricePerHour: recurso.pricePerHour,
                    resourceId: recurso.id,
                    venueId: recurso.venueId,
                    tiempoInicio,
                    jugadores,
                    marcador
                };
            }
        });
    }
}
