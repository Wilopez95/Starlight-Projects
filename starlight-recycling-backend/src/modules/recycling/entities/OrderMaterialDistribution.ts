import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

import BaseEntity from '../../../entities/BaseEntity';
import Order from './Order';
import { HaulingMaterial } from '../../../services/core/types/HaulingMaterial';

@Entity()
@ObjectType()
export class OrderMaterialDistribution extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Field()
  @Column()
  orderId!: number;

  @ManyToOne(() => Order, (order) => order.materialsDistribution)
  order!: Order;

  @Field()
  @Column()
  materialId!: number;

  material!: HaulingMaterial;

  @Field()
  @Column('numeric')
  value!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  recycle!: boolean;
}
