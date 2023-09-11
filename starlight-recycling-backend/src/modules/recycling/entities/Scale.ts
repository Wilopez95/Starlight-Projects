import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType, registerEnumType } from 'type-graphql';
import BaseEntityWithUserInfo from '../../../entities/BaseEntityWithUserInfo';

export enum ScaleConnectionStatus {
  CONNECTED = 'CONNECTED',
  PENDING_CONNECTION = 'PENDING_CONNECTION',
  FAILURE = 'FAILURE',
}

export enum ScaleUnitOfMeasurement {
  POUNDS = 'POUNDS',
  KILOGRAMS = 'KILOGRAMS',
  SHORT_TONS = 'SHORT_TONS',
  LONG_TONS = 'LONG_TONS',
  METRIC_TONS = 'METRIC_TONS',
}

registerEnumType(ScaleConnectionStatus, { name: 'ScaleConnectionStatus' });
registerEnumType(ScaleUnitOfMeasurement, { name: 'ScaleUnitOfMeasurement' });

@Entity()
@ObjectType()
export default class Scale extends BaseEntityWithUserInfo {
  @Field()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => ScaleConnectionStatus)
  @Column({
    type: 'enum',
    enum: ScaleConnectionStatus,
    default: ScaleConnectionStatus.PENDING_CONNECTION,
  })
  connectionStatus!: ScaleConnectionStatus;

  @Field({ nullable: true })
  @Column('integer', { nullable: true })
  computerId!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deviceName!: string;

  @Field({ nullable: true })
  @Column('integer', { nullable: true })
  deviceNumber!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  unitOfMeasurement?: ScaleUnitOfMeasurement;
}
