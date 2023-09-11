/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Subscriptions } from './Subscriptions';

@Entity()
@Unique(['subscriptionId', 'url'])
export class SubscriptionOrderMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  url: string;

  @Column({ type: 'text', default: null, name: 'file_name' })
  fileName: string;

  @Column({ type: 'text', default: null })
  author: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  public updatedAt: Date;

  @Column({ type: 'int4', nullable: false, name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(() => Subscriptions)
  @JoinColumn({ name: 'subscription_id' })
  subscriptionFK: Subscriptions;
}
