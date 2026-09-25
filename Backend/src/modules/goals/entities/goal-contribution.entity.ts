import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Wallet } from '../../wallets/entities/wallet.entity.js';
import { SavingGoal } from './saving-goal.entity.js';

@Entity('goal_contributions')
export class GoalContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'goal_id' })
  goalId: string;

  @ManyToOne(() => SavingGoal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: SavingGoal;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

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

  @Column({ name: 'from_wallet_id' })
  fromWalletId: string;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'from_wallet_id' })
  fromWallet: Wallet;

  @Column({ name: 'transaction_id', type: 'uuid', nullable: true })
  transactionId: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'contributed_at', type: 'date' })
  contributedAt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
