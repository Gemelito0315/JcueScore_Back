import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partida } from '../entities/partida.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PartidasService {
    constructor(
        @InjectRepository(Partida)
        private partidaRepository: Repository<Partida>,
        @InjectRepository(Resource)
        private recursoRepository: Repository<Resource>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async iniciarPartida(data: { resourceId: number; jugadores: string[]; startTime: string }) {
        const { resourceId, jugadores, startTime } = data;

        // Verificar que el recurso existe y está disponible
        const recurso = await this.recursoRepository.findOne({ 
            where: { id: resourceId },
            relations: ['venue']
        });

        if (!recurso) {
            throw new NotFoundException('Recurso no encontrado');
        }

        // Buscar jugadores por nombres
        const jugador1 = await this.userRepository.findOne({ 
            where: { name: jugadores[0] } 
        });
        const jugador2 = jugadores[1] ? await this.userRepository.findOne({ 
            where: { name: jugadores[1] } 
        }) : null;

        if (!jugador1) {
            throw new NotFoundException('Jugador 1 no encontrado');
        }

        // Crear nueva partida
        const partida = this.partidaRepository.create({
            recursoId: resourceId,
            jugador1Id: jugador1.id,
            jugador2Id: jugador2?.id,
            estado: 'en_juego',
            horaInicio: new Date(startTime),
            marcador: { j1: 0, j2: 0 }
        });

        return this.partidaRepository.save(partida);
    }

    async finalizarPartida(data: { partidaId: number; marcador: { j1: number; j2: number }; endTime: string }) {
        const { partidaId, marcador, endTime } = data;

        const partida = await this.partidaRepository.findOne({
            where: { id: partidaId },
            relations: ['recurso', 'jugador1', 'jugador2']
        });

        if (!partida) {
            throw new NotFoundException('Partida no encontrada');
        }

        // Calcular costo total basado en tiempo y precio del recurso
        const duracionHoras = (new Date(endTime).getTime() - partida.horaInicio.getTime()) / 3600000;
        const costoTotal = duracionHoras * partida.recurso.pricePerHour;

        // Actualizar partida
        partida.marcador = marcador;
        partida.estado = 'finalizada';
        partida.horaFin = new Date(endTime);
        partida.costoTotal = costoTotal;

        // Actualizar ELO de jugadores
        await this.actualizarEloJugadores(partida, marcador);

        return this.partidaRepository.save(partida);
    }

    async obtenerPartidasActivas() {
        return this.partidaRepository.find({
            where: { estado: 'en_juego' },
            relations: ['recurso', 'jugador1', 'jugador2'],
            order: { horaInicio: 'DESC' }
        });
    }

    async findOne(id: number) {
        return this.partidaRepository.findOne({
            where: { id },
            relations: ['recurso', 'jugador1', 'jugador2']
        });
    }

    private async actualizarEloJugadores(partida: Partida, marcador: { j1: number; j2: number }) {
        const { jugador1, jugador2 } = partida;
        const { j1: score1, j2: score2 } = marcador;

        if (!jugador1 || !jugador2) return;

        // Calcular nuevo ELO (simplificado)
        const kFactor = 32;
        const expectedScore1 = 1 / (1 + Math.pow(10, (jugador2.eloRating - jugador1.eloRating) / 400));
        const expectedScore2 = 1 - expectedScore1;

        const actualScore1 = score1 > score2 ? 1 : 0;
        const actualScore2 = score2 > score1 ? 1 : 0;

        jugador1.eloRating = Math.round(jugador1.eloRating + kFactor * (actualScore1 - expectedScore1));
        jugador2.eloRating = Math.round(jugador2.eloRating + kFactor * (actualScore2 - expectedScore2));

        // Actualizar estadísticas
        if (actualScore1 === 1) {
            jugador1.loyaltyPoints += 100;
            jugador2.loyaltyPoints += 25; // puntos de participación
        } else {
            jugador2.loyaltyPoints += 100;
            jugador1.loyaltyPoints += 25;
        }

        await this.userRepository.save([jugador1, jugador2]);
    }
}
