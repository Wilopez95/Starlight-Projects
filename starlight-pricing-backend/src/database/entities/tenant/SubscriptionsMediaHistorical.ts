/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Check(`"event_type" IN ('created', 'edited', 'deleted')`)
export class SubscriptionsMediaHistorical {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: false, name: 'original_id' })
  originalId: number;

  @Column({ type: 'text', nullable: false, name: 'event_type' })
  eventType: string;

  @Column({ type: 'text', nullable: false, name: 'user_id' })
  userId: string;

  @Column({ type: 'text', nullable: false, name: 'trace_id' })
  traceId: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  public updatedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'url' })
  url: string;

  @Column({ type: 'text', nullable: true, name: 'file_name' })
  fileName: string;

  @Column({ type: 'text', nullable: true, name: 'author' })
  author: string;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: number;
}
