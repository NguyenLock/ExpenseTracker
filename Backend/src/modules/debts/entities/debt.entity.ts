import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { Wallet } from '../../wallets/entities/wallet.entity.js';
import { DebtDirection, DebtStatus } from '../enums/debt.enums.js';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'person_name', length: 80 })
  personName: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value == null ? 0 : Number(value)),
    },
  })
  amount: number;

  @Column({ type: 'enum', enum: DebtDirection })
  direction: DebtDirection;

  @Index()
  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'enum', enum: DebtStatus, default: DebtStatus.OPEN })
  status: DebtStatus;

  /** When true and direction is owed_to_me, create income on/after due date automatically. */
  @Column({ name: 'auto_record', default: false })
  autoRecord: boolean;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'transaction_id', type: 'uuid', nullable: true })
  transactionId: string | null;

  @Column({ name: 'settled_at', type: 'timestamptz', nullable: true })
  settledAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
