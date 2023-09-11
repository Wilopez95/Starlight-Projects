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
import { ColumnNumericTransformer } from '../../../utils/ColumnNumericTransformer';
import { Prices } from './Prices';
import { RecurrentOrderTemplate } from './RecurrentOrderTemplates';

@Entity()
export class RecurrentOrderTemplateLineItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'recurrent_order_template_id' })
  recurrentOrderTemplateId: number;

  // @Column({ type: "int4", nullable: false })
  @ManyToOne(() => RecurrentOrderTemplate, recurrentOrderTemplate => recurrentOrderTemplate.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recurrent_order_template_id' })
  recurrentOrderTemplateFK: RecurrentOrderTemplate;

  @Column({ type: 'int4', nullable: false, name: 'billable_line_item_id' })
  billableLineItemId: number;

  @Column({ type: 'int4', nullable: true, name: 'material_id' })
  materialId: number;

  @Column({ type: 'int4', nullable: false, name: 'global_rates_line_items_id' })
  globalRatesLineItemsId: number;

  @Column({
    type: 'int4',
    nullable: true,
    name: 'custom_rates_group_line_items_id',
  })
  customRatesGroupLineItemsId: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  price: number;

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
    name: 'apply_surcharges',
  })
  applySurcharges: boolean;

  @Column({ name: 'price_id', nullable: true })
  priceId: number;

  // refactor starts here
  @ManyToOne(() => Prices, prices => prices.id)
  @JoinColumn({ name: 'price_id' })
  priceFK: Prices;

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
