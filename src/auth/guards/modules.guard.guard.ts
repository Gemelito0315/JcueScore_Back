import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModulesGuard implements CanActivate {
  // Configuración base de fallbacks de permisos para resiliencia en instalaciones sin seed inicial
  private readonly defaultRolePermissions: Record<string, string[]> = {
    admin: ['*'], // El admin tiene comodín de acceso absoluto
    garitero: [
      'reservations',
      'orders',
      'partidas',
      'inventory',
      'customers',
      'users',
      'resources',
      'billar',
    ],
    usuario: [
      'reservations',
      'loyalty',
      'customers',
      'partidas',
      'billar',
      'orders',
    ],
  };

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredModules =
      this.reflector.get<string[]>('modules', context.getHandler()) ||
      this.reflector.get<string[]>('modules', context.getClass());
      
    if (!requiredModules || requiredModules.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || user.roles.length === 0) {
      throw new ForbiddenException('Acceso denegado: El usuario no tiene roles asignados.');
    }

    const roleNames: string[] = user.roles.map((r: any) => r.name?.toLowerCase());

    // 1. Validar comodín de administrador
    if (roleNames.includes('admin')) {
      return true;
    }

    // 2. Intentar validación dinámica usando las relaciones TypeORM cargadas (role_modules)
    const hasDynamicAccess = user.roles.some((role: any) =>
      role.modules?.some((m: any) => requiredModules.includes(m.name)),
    );

    if (hasDynamicAccess) {
      return true;
    }

    // 3. Fallback a configuración de permisos estática para alta disponibilidad / robustez
    const hasStaticAccess = roleNames.some((roleName) => {
      const allowedModules = this.defaultRolePermissions[roleName];
      if (!allowedModules) return false;
      return requiredModules.some((m) => allowedModules.includes(m));
    });

    if (!hasStaticAccess) {
      throw new ForbiddenException(
        `Acceso denegado: Falta el permiso requerido para el/los módulo(s): ${requiredModules.join(', ')}`,
      );
    }

    return true;
  }
}
