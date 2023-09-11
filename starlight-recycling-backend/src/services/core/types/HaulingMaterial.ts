import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class HaulingMaterial {
  @Field()
  id!: number;

  @Field()
  originalId!: number;

  @Field()
  active!: boolean;

  @Field()
  description!: string;

  @Field()
  yard!: boolean;

  @Field()
  misc!: boolean;

  @Field()
  useForLoad!: boolean;

  @Field()
  useForDump!: boolean;

  @Field({ nullable: true })
  code?: string;

  @Field()
  recycle!: boolean;

  @Field({ nullable: true })
  units?: string;
}
