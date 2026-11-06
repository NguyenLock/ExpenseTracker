import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { getDataSourceOptions } from './database/data-source.js';
import { AiModule } from './modules/ai/ai.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BudgetsModule } from './modules/budgets/budgets.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { DebtsModule } from './modules/debts/debts.module.js';
import { GoalsModule } from './modules/goals/goals.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { TransactionTemplatesModule } from './modules/transaction-templates/transaction-templates.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        getDataSourceOptions({
          DATABASE_URL: config.get<string>('DATABASE_URL'),
          DB_HOST: config.get<string>('DB_HOST'),
          DB_PORT: config.get<string>('DB_PORT'),
          DB_USER: config.get<string>('DB_USER'),
          DB_PASSWORD: config.get<string>('DB_PASSWORD'),
          DB_NAME: config.get<string>('DB_NAME'),
        }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    WalletsModule,
    TransactionsModule,
    TransactionTemplatesModule,
    DebtsModule,
    BudgetsModule,
    GoalsModule,
    NotificationsModule,
    DashboardModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
