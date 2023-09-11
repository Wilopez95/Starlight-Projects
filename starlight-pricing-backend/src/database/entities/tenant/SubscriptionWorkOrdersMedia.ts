/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubscriptionWorkOrders } from './SubscriptionWorkOrders';

@Entity()
export class SubscriptionWorkOrdersMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'subscription_work_order_id' })
  subscriptionWorkOrderId: number;

  @ManyToOne(_ => SubscriptionWorkOrders, t => t.id)
  @JoinColumn({ name: 'subscription_work_order_id' })
  subscriptionWorkOrdersFK: SubscriptionWorkOrders;

  @Column({ type: 'text', nullable: false, name: 'url' })
  url: string;

  @Column({ type: 'timestamp', nullable: true, name: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'text', nullable: true, name: 'author' })
  author: string;

  @Column({ type: 'text', nullable: true, name: 'file_name' })
  fileName: string;

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
}
