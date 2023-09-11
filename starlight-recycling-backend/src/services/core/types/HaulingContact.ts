import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class HaulingContact {
  @Field()
  id!: number;
}
