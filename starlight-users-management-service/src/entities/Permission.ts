import { Directive, ObjectType, Field } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { BaseEntity } from '../db/BaseEntity';
import { ResourceType } from './Resource';

/**
 * @deprecated
 */
@Directive('@key(fields: "id")')
@ObjectType()
@Entity()
export class Permission extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column({ type: 'text', unique: true })
  name!: string;

  @Field(() => ResourceType)
  @Column({ type: 'enum', enum: ResourceType })
  type!: ResourceType;
}
