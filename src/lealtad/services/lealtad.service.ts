import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TransaccionLealtad, TipoTransaccion, FuenteTransaccion } from '../entities/transaccion-lealtad.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LealtadService {
    constructor(
        @InjectRepository(TransaccionLealtad)
        private transaccionRepository: Repository<TransaccionLealtad>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async getBalance(usuarioId: number) {
        const usuario = await this.userRepository.findOne({ where: { id: usuarioId } });
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return {
            usuarioId,
            jcueCoins: usuario.loyaltyPoints,
            totalMinado: await this.getTotalMinado(usuarioId),
            nivel: this.getNivel(usuario.loyaltyPoints),
            proximoNivel: this.getProximoNivel(usuario.loyaltyPoints)
        };
    }

    async getHistorial(usuarioId: number, limit: number = 50) {
        return this.transaccionRepository.find({
            where: { usuarioId },
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['club']
        });
    }

    async minarCoins(usuarioId: number, body: { 
        minutos: number; 
        ubicacionGPS?: { latitud: number; longitud: number };
    }) {
        const { minutos, ubicacionGPS } = body;
        const usuario = await this.userRepository.findOne({ where: { id: usuarioId } });
        
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Validar que no esté minando demasiado rápido (anti-trampa)
        const ultimaTransaccion = await this.transaccionRepository.findOne({
            where: { 
                usuarioId, 
                tipo: TipoTransaccion.MINING,
                fuente: FuenteTransaccion.GPS_CHECKIN 
            },
            order: { createdAt: 'DESC' }
        });

        if (ultimaTransaccion) {
            const tiempoDesdeUltima = Date.now() - ultimaTransaccion.createdAt.getTime();
            if (tiempoDesdeUltima < 55000) { // 55 segundos mínimo
                throw new BadRequestException('Espera antes de minar nuevamente');
            }
        }

        // Calcular coins a minar
        const coinsPorMinuto = 1;
        const coinsTotal = minutos * coinsPorMinuto;
        const bonusGPS = ubicacionGPS ? 0.5 : 0;
        const coinsConBonus = coinsTotal + bonusGPS;

        // Crear transacción
        const saldoAnterior = usuario.loyaltyPoints;
        const saldoNuevo = saldoAnterior + coinsConBonus;

        const transaccion = this.transaccionRepository.create({
            usuarioId,
            tipo: TipoTransaccion.MINING,
            fuente: FuenteTransaccion.GPS_CHECKIN,
            cantidad: coinsConBonus,
            saldoAnterior,
            saldoNuevo,
            metadata: {
                duracionMinutos: minutos,
                ubicacionGPS,
                dispositivo: 'web'
            },
            descripcion: `Mining: ${minutos} minutos + ${bonusGPS} bonus GPS`
        });

        // Actualizar balance del usuario
        usuario.loyaltyPoints = saldoNuevo;
        await this.userRepository.save(usuario);
        await this.transaccionRepository.save(transaccion);

        return {
            coinsMinados: coinsConBonus,
            balanceNuevo: saldoNuevo,
            nivel: this.getNivel(saldoNuevo)
        };
    }

    async canjearRecompensa(usuarioId: number, body: { 
        tipo: string; 
        costo: number; 
        descripcion: string;
    }) {
        const { tipo, costo, descripcion } = body;
        const usuario = await this.userRepository.findOne({ where: { id: usuarioId } });
        
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (usuario.loyaltyPoints < costo) {
            throw new BadRequestException('Coins insuficientes');
        }

        // Crear transacción de canje
        const saldoAnterior = usuario.loyaltyPoints;
        const saldoNuevo = saldoAnterior - costo;

        const transaccion = this.transaccionRepository.create({
            usuarioId,
            tipo: TipoTransaccion.CANJE_RECOMPENSA,
            fuente: FuenteTransaccion.SISTEMA,
            cantidad: -costo,
            saldoAnterior,
            saldoNuevo,
            metadata: { tipoRecompensa: tipo },
            descripcion: `Canje: ${descripcion}`
        });

        // Actualizar balance
        usuario.loyaltyPoints = saldoNuevo;
        await this.userRepository.save(usuario);
        await this.transaccionRepository.save(transaccion);

        return {
            recompensa: tipo,
            costo,
            balanceNuevo: saldoNuevo
        };
    }

    async otorgarBono(body: { 
        usuarioId: number; 
        cantidad: number; 
        motivo: string;
    }) {
        const { usuarioId, cantidad, motivo } = body;
        const usuario = await this.userRepository.findOne({ where: { id: usuarioId } });
        
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const saldoAnterior = usuario.loyaltyPoints;
        const saldoNuevo = saldoAnterior + cantidad;

        const transaccion = this.transaccionRepository.create({
            usuarioId,
            tipo: TipoTransaccion.BONO_ADMIN,
            fuente: FuenteTransaccion.ADMIN,
            cantidad,
            saldoAnterior,
            saldoNuevo,
            descripcion: `Bono admin: ${motivo}`
        });

        usuario.loyaltyPoints = saldoNuevo;
        await this.userRepository.save(usuario);
        await this.transaccionRepository.save(transaccion);

        return {
            cantidad,
            motivo,
            balanceNuevo: saldoNuevo
        };
    }

    async getLeaderboard(limit: number = 10) {
        return this.userRepository.find({
            order: { loyaltyPoints: 'DESC' },
            take: limit,
            select: ['id', 'name', 'lastName', 'loyaltyPoints', 'eloRating']
        });
    }

    async getEstadisticas() {
        const totalCoins = await this.userRepository
            .createQueryBuilder('user')
            .select('SUM(user.loyaltyPoints)', 'total')
            .getRawOne();

        const usuariosActivos = await this.userRepository.count({
            where: { loyaltyPoints: MoreThan(0) }
        });

        const transaccionesHoy = await this.transaccionRepository.count({
            where: {
                createdAt: MoreThan(new Date(new Date().setHours(0, 0, 0, 0)))
            }
        });

        return {
            totalCoinsEnCirculacion: totalCoins.total || 0,
            usuariosActivos,
            transaccionesHoy,
            coinsMinadosHoy: await this.getCoinsMinadosHoy()
        };
    }

    private async getTotalMinado(usuarioId: number): Promise<number> {
        const result = await this.transaccionRepository
            .createQueryBuilder('transaccion')
            .select('SUM(transaccion.cantidad)', 'total')
            .where('transaccion.usuarioId = :usuarioId', { usuarioId })
            .andWhere('transaccion.tipo = :tipo', { tipo: TipoTransaccion.MINING })
            .andWhere('transaccion.cantidad > 0')
            .getRawOne();

        return parseFloat(result.total) || 0;
    }

    private getNivel(coins: number): string {
        if (coins >= 10000) return 'Diamante';
        if (coins >= 5000) return 'Oro';
        if (coins >= 2000) return 'Plata';
        if (coins >= 500) return 'Bronce';
        return 'Novato';
    }

    private getProximoNivel(coins: number): { nombre: string; coinsRequeridos: number; coinsActuales: number } {
        if (coins >= 10000) return { nombre: 'Máximo', coinsRequeridos: 0, coinsActuales: coins };
        if (coins >= 5000) return { nombre: 'Diamante', coinsRequeridos: 10000, coinsActuales: coins };
        if (coins >= 2000) return { nombre: 'Oro', coinsRequeridos: 5000, coinsActuales: coins };
        if (coins >= 500) return { nombre: 'Plata', coinsRequeridos: 2000, coinsActuales: coins };
        return { nombre: 'Bronce', coinsRequeridos: 500, coinsActuales: coins };
    }

    private async getCoinsMinadosHoy(): Promise<number> {
        const result = await this.transaccionRepository
            .createQueryBuilder('transaccion')
            .select('SUM(transaccion.cantidad)', 'total')
            .where('transaccion.tipo = :tipo', { tipo: TipoTransaccion.MINING })
            .andWhere('transaccion.createdAt >= :hoy', { 
                hoy: new Date(new Date().setHours(0, 0, 0, 0)) 
            })
            .getRawOne();

        return parseFloat(result.total) || 0;
    }
}
