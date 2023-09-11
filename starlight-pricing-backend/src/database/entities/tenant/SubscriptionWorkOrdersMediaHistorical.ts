/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';

@Entity()
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class SubscriptionWorkOrdersMediaHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: true, name: 'trace_id' })
  traceId: string;

  @Column({ type: 'int4', nullable: false, name: 'subscription_work_order_id' })
  subscriptionWorkOrderId: number;

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
