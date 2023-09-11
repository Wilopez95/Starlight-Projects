/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subscriptions } from './Subscriptions';

@Entity()
@Check(`"action" IN ('added', 'changed', 'removed', 'other')`)
export class SubscriptionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: false, name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(_ => Subscriptions, request => request.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscriptionFK: Subscriptions;

  @Column({ type: 'text', nullable: false, name: 'action' })
  action: string;

  @Column({ type: 'text', nullable: true, name: 'attribute' })
  attribute: string;

  @Column({ type: 'text', nullable: true, name: 'entity' })
  entity: string;

  @Column({ type: 'text', nullable: true, name: 'entity_action' })
  entityAction: string;

  @Column({ type: 'text', nullable: false, name: 'made_by' })
  madeBy: string;

  @Column({ type: 'text', nullable: true, name: 'made_by_id' })
  madeById: string;

  @Column({ type: 'timestamp', nullable: true, name: 'effective_date' })
  effectiveDate: Date;

  @Column({ type: 'jsonb', nullable: true, name: 'description' })
  description: Object;

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
