import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ path: '/ws' })
@Injectable()
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  private readonly logger = new Logger(WebsocketsGateway.name);
  private clients = new Set<WebSocket>();
  private clientRooms = new Map<WebSocket, Set<string>>();
  private activeMatches = new Map<string, any>();

  handleConnection(client: WebSocket, ...args: any[]) {
    this.clients.add(client);
    this.clientRooms.set(client, new Set<string>());
    this.logger.log(`Cliente conectado. Total de clientes: ${this.clients.size}`);

    client.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          this.logger.log(`Autenticando socket cliente... Token recibido.`);
          try {
            const payload = this.jwtService.verify(message.token);
            (client as any).user = payload;
            this.logger.log(`Cliente autenticado exitosamente: ${payload.email}`);
            client.send(JSON.stringify({ type: 'auth_success', data: { email: payload.email } }));
          } catch (error) {
            this.logger.error('Error validando token JWT en WebSocket', error);
            client.send(JSON.stringify({ type: 'auth_error', message: 'Token inválido' }));
          }
        } else if (message.type === 'match_update') {
          // Si el estado indica que la partida terminó o se reseteó sin iniciar, podríamos limpiarla, 
          // pero por ahora siempre la guardamos.
          if (message.state && message.state.partidaIniciada === false && message.state.tiempoSegundos === 0) {
             this.activeMatches.delete(message.mesaId);
          } else {
             this.activeMatches.set(message.mesaId, message.state);
          }
          // Para no romper nada anterior, enviamos a la sala Y también podemos enviar broadcast global si es necesario.
          // Pero para optimizar, usamos broadcastToRoom.
          this.broadcastToRoom(message.mesaId, 'match_update', { mesaId: message.mesaId, state: message.state });
        } else if (message.type === 'join_match') {
          this.clientRooms.get(client)?.add(message.mesaId);
          const state = this.activeMatches.get(message.mesaId);
          if (state) {
            client.send(JSON.stringify({ type: 'match_update', data: { mesaId: message.mesaId, state } }));
          }
        } else if (message.type === 'leave_match') {
          this.clientRooms.get(client)?.delete(message.mesaId);
        } else if (message.type === 'get_active_matches') {
          try {
            const matches = Array.from(this.activeMatches.entries()).map(([mesaId, state]) => ({ mesaId, state }));
            client.send(JSON.stringify({ type: 'active_matches', data: matches }));
          } catch (e) {
            this.logger.error('Error al obtener partidas activas en WebSocket:', e);
            client.send(JSON.stringify({ type: 'error', message: 'No se pudieron obtener las partidas activas' }));
          }
        } else if (message.type === 'solicitar_cuenta') {
          // Tablet pide la cuenta → broadcast a TODOS (el garitero lo recibirá)
          this.logger.log(`Mesa ${message.mesaId} solicita la cuenta`);
          this.broadcast('solicitar_cuenta', {
            mesaId: message.mesaId,
            datos: message.datos || {},
          });
        } else if (message.type === 'cerrar_cuenta') {
          // Garitero cierra la cuenta → broadcast a la sala de la mesa (la tablet lo recibirá)
          this.logger.log(`Garitero cierra la cuenta de Mesa ${message.mesaId}`);
          this.broadcastToRoom(message.mesaId, 'match_update', {
            mesaId: message.mesaId,
            type: 'cerrar_cuenta',
          });
          // También broadcast global para que el panel de ventas se actualice
          this.broadcast('cerrar_cuenta', { mesaId: message.mesaId });
          // Limpiar match activo
          this.activeMatches.delete(message.mesaId);
        }
      } catch (err) {
        this.logger.error('Error parseando mensaje WebSocket de cliente:', err);
      }
    });

    client.on('error', (err) => {
      this.logger.error('Error en conexión socket de cliente:', err);
    });
  }

  handleDisconnect(client: WebSocket) {
    this.clients.delete(client);
    this.clientRooms.delete(client);
    this.logger.log(`Cliente desconectado. Total de clientes: ${this.clients.size}`);
  }

  broadcast(type: string, data: any) {
    const payload = JSON.stringify({ type, data, timestamp: new Date() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  broadcastToRoom(room: string, type: string, data: any) {
    const payload = JSON.stringify({ type, data, timestamp: new Date() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN && this.clientRooms.get(client)?.has(room)) {
        client.send(payload);
      }
    }
  }

  addActiveMatch(mesaId: string, state: any) {
    // Si ya existe y tiene frame, no lo sobreescribimos por completo para no perder la cámara,
    // o al menos actualizamos lo que haga falta
    const existing = this.activeMatches.get(mesaId);
    const newState = existing ? { ...existing, ...state } : state;
    this.activeMatches.set(mesaId, newState);
    this.broadcast('match_update', { mesaId, state: newState });
  }

  removeActiveMatch(mesaId: string) {
    this.activeMatches.delete(mesaId);
    this.broadcast('match_update', { mesaId, state: { partidaIniciada: false, tiempoSegundos: 0 } });
  }
}
