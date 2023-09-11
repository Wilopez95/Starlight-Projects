/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subscriptions } from './Subscriptions';

@Entity()
@Unique(['subscriptionId', 'url'])
export class SubscriptionsMedia {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'text', nullable: false, name: 'url' })
  url: string;

  @Column({ type: 'text', nullable: true, name: 'file_name' })
  fileName: string;

  @Column({ type: 'text', nullable: true, name: 'author' })
  author: string;

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

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(() => Subscriptions, subscriptions => subscriptions.id, {
    cascade: true,
  })
  @JoinColumn({ name: 'subscription_id' })
  subscriptionFK: Subscriptions;
}
