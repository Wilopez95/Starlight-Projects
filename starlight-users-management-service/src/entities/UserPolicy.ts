import { Field, ObjectType } from 'type-graphql';
import { Entity, ManyToOne } from 'typeorm';

import { Policy } from './Policy';
import { User } from './User';

@ObjectType()
@Entity()
export class UserPolicy extends Policy {
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.policies)
  user!: User;
}
