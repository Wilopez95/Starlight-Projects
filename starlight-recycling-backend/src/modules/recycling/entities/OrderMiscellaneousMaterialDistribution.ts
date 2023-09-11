import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

import BaseEntity from '../../../entities/BaseEntity';
import Order from './Order';
import { HaulingMaterial } from '../../../services/core/types/HaulingMaterial';

@Entity()
@ObjectType()
export class OrderMiscellaneousMaterialDistribution extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Field()
  @Column()
  orderId!: number;

  @ManyToOne(() => Order, (order: Order) => order.miscellaneousMaterialsDistribution)
  order!: Order;

  @Field()
  @Column()
  materialId!: number;

  material!: HaulingMaterial;

  @Field()
  @Column('numeric')
  quantity!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  recycle!: boolean;
}
