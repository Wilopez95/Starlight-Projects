import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';

import BaseEntityWithUserInfo from '../../../entities/BaseEntityWithUserInfo';
import { MeasurementType, MeasurementUnit } from '../graphql/types/Measurements';
import { User } from '../../../services/ums/users';

@Entity()
@ObjectType()
export default class NonCommercialTruck extends BaseEntityWithUserInfo {
  @Field()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Field({ nullable: true })
  @Column('integer', { nullable: true })
  customerId?: number;

  @Field({ nullable: true })
  @Column('varchar', { length: 100, nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column('varchar', { length: 25, nullable: true })
  licensePlate?: string;

  @Field(() => Number, { nullable: true })
  @Column({ type: 'double precision', nullable: true })
  emptyWeight: number | null = null;

  @Field(() => MeasurementUnit, { nullable: true })
  @Column({ type: 'enum', enum: MeasurementUnit, nullable: true })
  emptyWeightUnit!: MeasurementUnit;

  @Field(() => MeasurementType, { nullable: true })
  @Column({ type: 'enum', enum: MeasurementType, nullable: true })
  emptyWeightType!: MeasurementType;

  @Field({ nullable: true })
  @Column('varchar', { nullable: true })
  emptyWeightSource!: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  emptyWeightTimestamp!: Date;

  @Field(() => User, { nullable: true })
  @Column({ type: 'varchar', nullable: true })
  emptyWeightUser!: string;
}
