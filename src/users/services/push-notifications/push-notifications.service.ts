import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PushNotificationsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    // Inicializar Web Push con VAPID keys
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:hola@jcuescore.com',
      process.env.VAPID_PUBLIC_KEY || 'BJKNFKDZzDGYnsEPVnXvL3AiZEbueqH6ighFuuvVnhnVm8mGb5ofoKEA55a7AlyK7UHZk0xximyqOkQ_T_dshzg',
      process.env.VAPID_PRIVATE_KEY || 'iTKSqFhwZaggQXiNAYW1iWfssIqaIvTtbZ1AuRQvkXk'
    );
  }

  async saveSubscription(userId: number, subscription: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    if (!user.pushSubscriptions) {
      user.pushSubscriptions = [];
    }

    const exists = user.pushSubscriptions.find(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await this.userRepo.save(user);
    }
  }

  async sendNotificationToUser(userId: number, payload: any) {
    const user = await this.userRepo.findOne({ where: { id: userId, isActive: true } });
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return; // No hay suscripciones para este usuario
    }

    const validSubscriptions: any[] = [];
    let hasInvalidSubscriptions = false;

    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
        validSubscriptions.push(sub);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Suscripción expirada o inválida, se descartará
          hasInvalidSubscriptions = true;
        } else {
          console.error(`Error enviando push notification a ${user.email}:`, error);
          validSubscriptions.push(sub); // Mantenerla por si es un fallo temporal
        }
      }
    }

    // Limpiar suscripciones inválidas en la DB
    if (hasInvalidSubscriptions) {
      user.pushSubscriptions = validSubscriptions;
      await this.userRepo.save(user);
    }
  }

  async sendNotificationToRole(roleName: string, payload: any) {
    // Encontrar todos los usuarios con el rol especificado
    const users = await this.userRepo.createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .where('role.name = :roleName', { roleName })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();

    const notifications = users.map(user => this.sendNotificationToUser(user.id, payload));
    await Promise.all(notifications);
  }

  async broadcastNotification(payload: any) {
    // Enviar notificación a todos los usuarios activos que tengan suscripciones
    const users = await this.userRepo.createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere('user.pushSubscriptions IS NOT NULL')
      .getMany();

    const notifications = users.map(user => this.sendNotificationToUser(user.id, payload));
    await Promise.all(notifications);
  }
}
