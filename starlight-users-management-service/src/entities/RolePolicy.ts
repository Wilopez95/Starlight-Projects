import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from 'typeorm';

import { Policy } from './Policy';
import { Role } from './Role';

@ObjectType()
@Entity()
export class RolePolicy extends Policy {
  @Field(() => Role)
  @ManyToOne(() => Role, (role) => role.policies)
  role!: Role;
}
