import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

import BaseEntityWithUserInfo from '../../../entities/BaseEntityWithUserInfo';
import { EventListenerTypes, ObservableEntity } from '../../../decorators/Observable';
import { MeasurementType, MeasurementUnit } from '../graphql/types/Measurements';
import { User } from '../../../services/ums/users';

export enum CustomerTruckTypes {
  ROLLOFF = 'ROLLOFF',
  TRACTORTRAILER = 'TRACTORTRAILER',
  DUMPTRUCK = 'DUMPTRUCK',
}

registerEnumType(CustomerTruckTypes, {
  name: 'CustomerTruckTypes',
});

@Entity()
@ObjectType()
@ObservableEntity({
  events: [EventListenerTypes.AFTER_UPDATE],
})
export default class CustomerTruck extends BaseEntityWithUserInfo {
  @Field()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Field()
  @Column()
  customerId!: number;

  @Field({ nullable: true })
  @Column('varchar', { length: 100, nullable: true })
  description?: string;

  @Field()
  @Column('boolean')
  active!: boolean;

  @Field(() => CustomerTruckTypes)
  @Column({ type: 'enum', enum: CustomerTruckTypes })
  type!: CustomerTruckTypes;

  @Field()
  @Column('varchar', { length: 25 })
  truckNumber!: string;

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
