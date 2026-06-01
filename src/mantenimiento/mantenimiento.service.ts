import { Injectable } from '@nestjs/common';

export interface MaintenanceConfig {
  active: boolean;
  message: string;
  estimatedTime: string;
  timestamp: string;
}

@Injectable()
export class MantenimientoService {
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
    return this.config;
  }
}
