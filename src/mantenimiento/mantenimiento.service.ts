import { Injectable } from '@nestjs/common';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

export interface MaintenanceConfig {
  active: boolean;
  message: string;
  estimatedTime: string;
  timestamp: string;
}

@Injectable()
export class MantenimientoService {
  constructor(private readonly wsGateway: WebsocketsGateway) {}

  private config: MaintenanceConfig = {
    active: false,
    message: 'Estamos realizando mejoras en el sistema',
    estimatedTime: '',
    timestamp: new Date().toISOString(),
  };

  getStatus() {
    return this.config;
  }

  updateStatus(data: { active: boolean; message?: string; estimatedTime?: string }) {
    this.config = {
      ...this.config,
      active: data.active,
      message: data.message || this.config.message,
      estimatedTime: data.estimatedTime || '',
      timestamp: new Date().toISOString(),
    };

    // Broadcast a todos los clientes conectados por WebSocket
    this.wsGateway.broadcast('sistema_mantenimiento', {
      activo: this.config.active,
      mensaje: this.config.message,
      estimatedTime: this.config.estimatedTime,
    });

    return this.config;
  }
}
