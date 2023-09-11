/* eslint-disable new-cap */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Orders } from './Orders';
import { RecurrentOrderTemplate } from './RecurrentOrderTemplates';

@Entity()
export class RecurrentOrderTemplateOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Orders, request => request.id)
  @JoinColumn({ name: 'order_id' })
  orderFK: Orders;

  @Column({ name: 'recurrent_order_template_id' })
  recurrentOrderTemplateId: number;

  @ManyToOne(() => RecurrentOrderTemplate, recurrentOrderTemplate => recurrentOrderTemplate.id)
  @JoinColumn({ name: 'recurrent_order_template_id' })
  recurrentOrderTemplateFK: RecurrentOrderTemplate;

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
