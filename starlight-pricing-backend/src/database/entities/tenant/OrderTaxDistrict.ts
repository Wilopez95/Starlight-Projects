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

@Entity()
export class OrderTaxDistrict {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int4', nullable: true, name: 'tax_district_id' })
  taxDistrictId: number;

  @Column({ type: 'int4', nullable: true, name: 'order_id' })
  orderId: number;

  @ManyToOne(_ => Orders, request => request.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  orderFK: Orders;

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
