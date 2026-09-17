import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private readonly dataSource: DataSource) {}

  getHello(): string {
    return 'ExpenseTracker API';
  }

  async getHealth() {
    const dbOk = this.dataSource.isInitialized;
    return {
      status: dbOk ? 'ok' : 'degraded',
      database: dbOk ? 'up' : 'down',
    };
  }
}
