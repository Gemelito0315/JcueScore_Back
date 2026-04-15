import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  getHello(): string {
    return 'Billar JJ API';
  }

  async getMaintenance() {
    try {
      await this.ds.query(
        `CREATE TABLE IF NOT EXISTS app_settings (key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL)`
      );
      const rows = await this.ds.query(
        `SELECT value FROM app_settings WHERE key = 'maintenance'`
      );
      if (!rows.length) return { active: false, message: 'En mantenimiento', estimatedTime: '' };
      return JSON.parse(rows[0].value);
    } catch (e) {
      console.error('getMaintenance error:', e.message);
      return { active: false, message: 'En mantenimiento', estimatedTime: '' };
    }
  }

  async setMaintenance(data: { active: boolean; message?: string; estimatedTime?: string }) {
    await this.ds.query(
      `CREATE TABLE IF NOT EXISTS app_settings (key VARCHAR(100) PRIMARY KEY, value TEXT NOT NULL)`
    );
    const value = JSON.stringify({
      active: data.active,
      message: data.message ?? 'Estamos realizando mejoras.',
      estimatedTime: data.estimatedTime ?? '',
    });
    await this.ds.query(
      `INSERT INTO app_settings (key, value) VALUES ('maintenance', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [value]
    );
    return JSON.parse(value);
  }
}
