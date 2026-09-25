import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { Wallet } from '../wallets/entities/wallet.entity.js';
import { TransactionTemplate } from './entities/transaction-template.entity.js';
import { TransactionTemplatesController } from './transaction-templates.controller.js';
import { TransactionTemplatesService } from './transaction-templates.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionTemplate, Wallet, Category]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [TransactionTemplatesController],
  providers: [TransactionTemplatesService],
})
export class TransactionTemplatesModule {}
