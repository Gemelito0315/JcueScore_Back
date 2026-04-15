import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LocalNetworkGuard implements CanActivate {
  // Lista de IPs permitidas (La IP externa pública de tu Billar o las redes locales)
  private readonly allowedIPs = [
    '127.0.0.1', 
    '::1', 
    // '192.168.1.X', // Aquí se añadiría la IP local si están en la misma LAN
    // 'X.X.X.X'      // Aquí se añadiría la IP pública estática de tu negocio
  ];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extraer la IP desde donde se hace la petición de forma segura
    const clientIp = request.ip || request.socket?.remoteAddress || '';

    // Verificar si la IP está en la lista blanca
    const isAllowed = this.allowedIPs.some(ip => clientIp.includes(ip));

    if (!isAllowed) {
      throw new ForbiddenException(
        'ACCESO DENEGADO: Módulo Garitero. Solo puedes usar esta función si estás conectado al WiFi / Red Física del Billar.',
      );
    }

    return true;
  }
}
