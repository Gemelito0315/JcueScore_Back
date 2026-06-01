import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Torneo, FormatoTorneo, EstadoTorneo } from '../entities/torneo.entity';
import {
  InscripcionTorneo,
  EstadoInscripcion,
} from '../entities/inscripcion-torneo.entity';
import {
  PartidoTorneo,
  EstadoPartido,
  FaseTorneo,
} from '../entities/partido-torneo.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class TorneosService {
  constructor(
    @InjectRepository(Torneo)
    private torneoRepository: Repository<Torneo>,
    @InjectRepository(InscripcionTorneo)
    private inscripcionRepository: Repository<InscripcionTorneo>,
    @InjectRepository(PartidoTorneo)
    private partidoRepository: Repository<PartidoTorneo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.torneoRepository.find({
      relations: ['inscripciones', 'inscripciones.jugador'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveTournaments() {
    return this.torneoRepository.find({
      where: {
        estado: In([EstadoTorneo.INSCRIPCION, EstadoTorneo.EN_CURSO]),
      },
      relations: ['inscripciones'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    return this.torneoRepository.findOne({
      where: { id },
      relations: [
        'inscripciones',
        'inscripciones.jugador',
        'partidos',
        'partidos.jugador1',
        'partidos.jugador2',
      ],
    });
  }

  async getInscripciones(torneoId: number) {
    return this.inscripcionRepository.find({
      where: { torneoId },
      relations: ['jugador'],
      order: { createdAt: 'ASC' },
    });
  }

  async getPartidos(torneoId: number) {
    return this.partidoRepository.find({
      where: { torneoId },
      relations: ['jugador1', 'jugador2'],
      order: { fechaProgramada: 'ASC' },
    });
  }

  async create(createTorneoDto: any) {
    const torneo = this.torneoRepository.create({
      ...createTorneoDto,
      estado: EstadoTorneo.INSCRIPCION,
    });
    return this.torneoRepository.save(torneo);
  }

  async inscribirJugador(
    torneoId: number,
    body: { jugadorId: number; handicap?: number },
  ) {
    const { jugadorId, handicap } = body;

    // Verificar torneo
    const torneo = await this.torneoRepository.findOne({
      where: { id: torneoId },
    });

    if (!torneo) {
      throw new NotFoundException('Torneo no encontrado');
    }

    if (torneo.estado !== EstadoTorneo.INSCRIPCION) {
      throw new BadRequestException(
        'El torneo no está en período de inscripción',
      );
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await this.inscripcionRepository.findOne({
      where: { torneoId, jugadorId },
    });

    if (inscripcionExistente) {
      throw new BadRequestException(
        'El jugador ya está inscrito en este torneo',
      );
    }

    // Verificar cupo
    const inscripcionesCount = await this.inscripcionRepository.count({
      where: { torneoId, estado: Not(EstadoInscripcion.CANCELADA) },
    });

    if (inscripcionesCount >= torneo.maxJugadores) {
      throw new BadRequestException('El torneo ya alcanzó el cupo máximo');
    }

    // Crear inscripción
    const inscripcion = this.inscripcionRepository.create({
      torneoId,
      jugadorId,
      handicap: handicap || 30,
      estado: EstadoInscripcion.PENDIENTE,
    });

    return this.inscripcionRepository.save(inscripcion);
  }

  async generarPartidos(torneoId: number) {
    const torneo = await this.torneoRepository.findOne({
      where: { id: torneoId },
      relations: ['inscripciones'],
    });

    if (!torneo) {
      throw new NotFoundException('Torneo no encontrado');
    }

    const inscripciones = torneo.inscripciones.filter(
      (ins) => ins.estado === EstadoInscripcion.CONFIRMADA,
    );

    if (inscripciones.length < torneo.minJugadores) {
      throw new BadRequestException('No hay suficientes jugadores confirmados');
    }

    // Eliminar partidos existentes
    await this.partidoRepository.delete({ torneoId });

    // Generar partidos según formato
    switch (torneo.formato) {
      case FormatoTorneo.ROUND_ROBIN:
        return this.generarRoundRobin(torneoId, inscripciones);
      case FormatoTorneo.ELIMINACION_DIRECTA:
        return this.generarEliminacionDirecta(torneoId, inscripciones);
      default:
        throw new BadRequestException('Formato de torneo no implementado');
    }
  }

  private async generarRoundRobin(
    torneoId: number,
    inscripciones: InscripcionTorneo[],
  ) {
    const partidos: PartidoTorneo[] = [];

    for (let i = 0; i < inscripciones.length; i++) {
      for (let j = i + 1; j < inscripciones.length; j++) {
        const partido = this.partidoRepository.create({
          torneoId,
          jugador1Id: inscripciones[i].jugadorId,
          jugador2Id: inscripciones[j].jugadorId,
          estado: EstadoPartido.PENDIENTE,
          fase: FaseTorneo.GRUPOS,
          numeroGrupo: 1,
        });
        partidos.push(partido);
      }
    }

    return this.partidoRepository.save(partidos);
  }

  private async generarEliminacionDirecta(
    torneoId: number,
    inscripciones: InscripcionTorneo[],
  ) {
    const partidos: PartidoTorneo[] = [];
    const jugadores = [...inscripciones].sort(() => Math.random() - 0.5); // Random shuffle

    // Primera ronda
    for (let i = 0; i < jugadores.length; i += 2) {
      if (i + 1 < jugadores.length) {
        const partido = this.partidoRepository.create({
          torneoId,
          jugador1Id: jugadores[i].jugadorId,
          jugador2Id: jugadores[i + 1].jugadorId,
          estado: EstadoPartido.PENDIENTE,
          fase: FaseTorneo.OCTAVOS,
        });
        partidos.push(partido);
      }
    }

    return this.partidoRepository.save(partidos);
  }

  async registrarResultado(partidoId: number, body: any) {
    const partido = await this.partidoRepository.findOne({
      where: { id: partidoId },
      relations: ['jugador1', 'jugador2'],
    });

    if (!partido) {
      throw new NotFoundException('Partido no encontrado');
    }

    if (partido.estado !== EstadoPartido.PENDIENTE) {
      throw new BadRequestException('El partido ya está finalizado');
    }

    // Actualizar resultado
    partido.jugador1Score = body.jugador1Score;
    partido.jugador2Score = body.jugador2Score;
    partido.jugador1Innings = body.jugador1Innings;
    partido.jugador2Innings = body.jugador2Innings;
    partido.estado = EstadoPartido.FINALIZADO;
    partido.fechaFin = new Date();

    // Calcular estadísticas (fechaInicio puede ser null si no se registró inicio)
    const duracion = partido.fechaInicio
      ? partido.fechaFin.getTime() - partido.fechaInicio.getTime()
      : 0;
    const innings1 = body.jugador1Innings || 1;
    const innings2 = body.jugador2Innings || 1;
    partido.estadisticas = {
      duracionMinutos: Math.floor(duracion / 60000),
      promedioJugador1: body.jugador1Score / innings1,
      promedioJugador2: body.jugador2Score / innings2,
    };

    // Actualizar ELO y estadísticas de jugadores
    await this.actualizarEstadisticasJugadores(partido);

    return this.partidoRepository.save(partido);
  }

  private async actualizarEstadisticasJugadores(partido: PartidoTorneo) {
    const { jugador1, jugador2, jugador1Score, jugador2Score } = partido;

    if (!jugador1 || !jugador2) return;

    // Actualizar ELO
    const kFactor = 32;
    const expectedScore1 =
      1 / (1 + Math.pow(10, (jugador2.eloRating - jugador1.eloRating) / 400));
    const actualScore1 = jugador1Score > jugador2Score ? 1 : 0;

    jugador1.eloRating = Math.round(
      jugador1.eloRating + kFactor * (actualScore1 - expectedScore1),
    );
    jugador2.eloRating = Math.round(
      jugador2.eloRating + kFactor * (1 - actualScore1 - (1 - expectedScore1)),
    );

    // Actualizar puntos de lealtad
    if (actualScore1 === 1) {
      jugador1.loyaltyPoints += 200;
      jugador2.loyaltyPoints += 50;
    } else {
      jugador2.loyaltyPoints += 200;
      jugador1.loyaltyPoints += 50;
    }

    await this.userRepository.save([jugador1, jugador2]);
  }

  async update(id: number, updateTorneoDto: any) {
    await this.torneoRepository.update(id, updateTorneoDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.torneoRepository.delete(id);
  }
}
