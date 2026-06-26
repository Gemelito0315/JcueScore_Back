import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partida } from '../entities/partida.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { User } from '../../users/entities/user.entity';
import { WebsocketsGateway } from '../../websockets/websockets.gateway';
import { OnModuleInit } from '@nestjs/common';
import { PushNotificationsService } from '../../users/services/push-notifications/push-notifications.service';

@Injectable()
export class PartidasService {
  constructor(
    @InjectRepository(Partida)
    private partidaRepository: Repository<Partida>,
    @InjectRepository(Resource)
    private recursoRepository: Repository<Resource>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private wsGateway: WebsocketsGateway,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async onModuleInit() {
    // Populate the WebsocketGateway with any currently running matches from the DB
    try {
      const activas = await this.obtenerPartidasActivas();
      for (const p of activas) {
        if (p.recurso) {
          const state = {
            partidaIniciada: true,
            tiempoSegundos: Math.floor((new Date().getTime() - new Date(p.horaInicio).getTime()) / 1000),
            jugadores: [
              { nombre: p.jugador1?.name || p.jugador1NombreOcasional || 'Jugador 1', puntos: p.marcador?.j1 || 0, meta: 15 },
              { nombre: p.jugador2?.name || p.jugador2NombreOcasional || 'Invitado', puntos: p.marcador?.j2 || 0, meta: 15 }
            ],
            frame: null
          };
          this.wsGateway.addActiveMatch(p.recurso.id.toString(), state);
        }
      }
    } catch (e) {
      console.log('No se pudieron precargar las partidas activas en el WebsocketGateway', e);
    }
  }

  async iniciarPartida(data: {
    resourceId: number;
    jugadores: string[];
    startTime: string;
    jugador1Id?: number;
    jugador2Id?: number;
  }) {
    const { resourceId, jugadores, startTime, jugador1Id, jugador2Id } = data;

    // Verificar que el recurso existe
    const recurso = await this.recursoRepository.findOne({
      where: { id: resourceId },
      relations: ['venue'],
    });

    if (!recurso) {
      throw new NotFoundException('Recurso no encontrado');
    }

    // Buscar jugador1: primero por ID si se proporcionó, luego por nombre
    let jugador1: any = null;
    if (jugador1Id) {
      jugador1 = await this.userRepository.findOne({ where: { id: jugador1Id } });
    }
    if (!jugador1 && jugadores[0]) {
      // Buscar por nombre exacto primero
      jugador1 = await this.userRepository.findOne({ where: { name: jugadores[0] } });
      if (!jugador1) {
        const term = jugadores[0].trim().toLowerCase();
        jugador1 = await this.userRepository
          .createQueryBuilder('user')
          .where("LOWER(CONCAT(user.name, ' ', COALESCE(user.lastName, ''))) = :term", { term })
          .orWhere("LOWER(user.name) = :term", { term })
          .getOne();
      }
    }
    // Buscar jugador2 (opcional)
    let jugador2: any = null;
    if (jugador2Id) {
      jugador2 = await this.userRepository.findOne({ where: { id: jugador2Id } });
    }
    if (!jugador2 && jugadores[1]) {
      jugador2 = await this.userRepository.findOne({ where: { name: jugadores[1] } });
      if (!jugador2) {
        const term = jugadores[1].trim().toLowerCase();
        jugador2 = await this.userRepository
          .createQueryBuilder('user')
          .where("LOWER(CONCAT(user.name, ' ', COALESCE(user.lastName, ''))) = :term", { term })
          .orWhere("LOWER(user.name) = :term", { term })
          .getOne();
      }
    }

    if (recurso.status !== 'available') {
      throw new BadRequestException('El recurso no está disponible');
    }

    // Cambiar estado a ocupado
    recurso.status = 'occupied';
    await this.recursoRepository.save(recurso);

    const partida = await this.partidaRepository.save(this.partidaRepository.create({
      recurso,
      jugador1Id: jugador1?.id || null,
      jugador1NombreOcasional: jugador1 ? null : (jugadores[0] || 'Cliente Ocasional'),
      jugador2Id: jugador2?.id || null,
      jugador2NombreOcasional: jugador2 ? null : (jugadores[1] || null),
      estado: 'en_juego',
      horaInicio: new Date(), // Tiempo real del servidor
      marcador: { j1: 0, j2: 0 },
    }));

    // Register active match in the Websocket Gateway so Espectador TV sees it immediately
    const state = {
      partidaIniciada: true,
      timerActivo: true, // <-- Esto faltaba para que la tablet arranque su cronómetro
      tiempoSegundos: 0,
      tiempoInicio: new Date().toISOString(), // <-- Para asegurar que tengan la misma hora
      jugadores: [
        { nombre: jugador1?.name || jugadores[0] || 'Jugador 1', puntos: 0, meta: 15 },
        { nombre: jugador2?.name || jugadores[1] || 'Invitado', puntos: 0, meta: 15 }
      ],
      frame: null
    };
    this.wsGateway.addActiveMatch(recurso.id.toString(), state);

    // Enviar notificación push a todos los usuarios registrados para invitarlos a ver la partida
    const j1Name = jugador1?.name || jugadores[0] || 'Jugador 1';
    const j2Name = jugador2?.name || jugadores[1] || null;
    const bodyMsg = j2Name
      ? `${j1Name} vs ${j2Name} en Mesa ${recurso.code} — ¡Entra a verla en vivo!`
      : `${j1Name} en Mesa ${recurso.code} — ¡Partida en vivo ahora!`;

    this.pushNotificationsService.broadcastNotification({
      notification: {
        title: '🎱 ¡Partida en Vivo!',
        body: bodyMsg,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [100, 50, 100, 50, 100],
        data: { url: '/usuario/espectador' },
        actions: [
          { action: 'ver', title: '👁️ Ver en vivo' },
          { action: 'dismiss', title: 'Cerrar' }
        ]
      }
    });

    return partida;
  }

  async finalizarPartida(data: {
    partidaId: number;
    marcador: { j1: number; j2: number };
    endTime?: string;
    metodoPago?: string;
  }) {
    const { partidaId, marcador, metodoPago } = data;

    return this.partidaRepository.manager.transaction(async transactionalEntityManager => {
      const partida = await transactionalEntityManager.findOne(Partida, {
        where: { id: partidaId },
        relations: ['recurso', 'jugador1', 'jugador2'],
      });

      if (!partida) {
        throw new NotFoundException('Partida no encontrada');
      }

      // Tiempo real del servidor
      const horaFinExacta = new Date();

      // Calcular costo total basado en tiempo y precio del recurso
      const duracionHoras =
        (horaFinExacta.getTime() - partida.horaInicio.getTime()) / 3600000;
      const costoTotal = duracionHoras * partida.recurso.pricePerHour;

      // Actualizar partida
      partida.marcador = marcador;
      partida.estado = 'finalizada';
      partida.horaFin = horaFinExacta;
      partida.costoTotal = costoTotal;
      if (metodoPago) {
        partida.metodoPago = metodoPago;
      }

      partida.recurso.status = 'available';
      await transactionalEntityManager.save(partida.recurso);

      // Remove the match from active matches
      this.wsGateway.removeActiveMatch(partida.recurso.id.toString());

      return transactionalEntityManager.save(partida);
    });
  }

  async obtenerPartidasActivas() {
    return this.partidaRepository.find({
      where: { estado: 'en_juego' },
      relations: ['recurso', 'jugador1', 'jugador2'],
      order: { horaInicio: 'DESC' },
    });
  }

  async getPartidaActivaUser(userId: number) {
    const partida = await this.partidaRepository.findOne({
      where: [
        { estado: 'en_juego', jugador1Id: userId },
        { estado: 'en_juego', jugador2Id: userId }
      ],
      relations: ['recurso', 'jugador1', 'jugador2'],
      order: { horaInicio: 'DESC' },
    });
    
    if (!partida) return null;

    return {
      id: partida.id,
      recursoId: partida.recurso?.id,
      recursoCode: partida.recurso?.code,
      recursoPricePerHour: partida.recurso?.pricePerHour,
      jugador1Name: partida.jugador1?.name,
      jugador2Name: partida.jugador2?.name,
      horaInicio: partida.horaInicio,
      marcador: partida.marcador,
      estado: partida.estado
    };
  }

  async findAll(periodo: string) {
    const queryBuilder = this.partidaRepository.createQueryBuilder('partida')
      .leftJoinAndSelect('partida.recurso', 'recurso')
      .leftJoinAndSelect('partida.jugador1', 'jugador1')
      .leftJoinAndSelect('partida.jugador2', 'jugador2')
      .orderBy('partida.horaInicio', 'DESC');

    if (periodo && periodo !== 'historico' && periodo !== 'todos') {
      const hoy = new Date();
      let fechaFiltro: Date | undefined = undefined;

      if (periodo === 'dia') {
        fechaFiltro = new Date();
        fechaFiltro.setHours(0, 0, 0, 0);
      } else if (periodo === 'semana') {
        fechaFiltro = new Date();
        fechaFiltro.setDate(fechaFiltro.getDate() - 7);
        fechaFiltro.setHours(0, 0, 0, 0);
      } else if (periodo === 'mes') {
        fechaFiltro = new Date();
        fechaFiltro.setDate(fechaFiltro.getDate() - 30);
        fechaFiltro.setHours(0, 0, 0, 0);
      }

      if (fechaFiltro) {
        queryBuilder.where('partida.horaInicio >= :fechaFiltro', { fechaFiltro });
      }
    }

    return queryBuilder.getMany();
  }

  async getIngresosDia() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const partidas = await this.partidaRepository
      .createQueryBuilder('p')
      .where('p.estado = :estado', { estado: 'finalizada' })
      .andWhere('p.horaFin >= :hoy', { hoy })
      .andWhere('p.horaFin < :manana', { manana })
      .getMany();

    return [
      {
        dia: hoy.toISOString().split('T')[0],
        valor: partidas.reduce((acc, p) => acc + Number(p.costoTotal || 0), 0),
      },
    ];
  }


  async findOne(id: number) {
    return this.partidaRepository.findOne({
      where: { id },
      relations: ['recurso', 'jugador1', 'jugador2'],
    });
  }
}
