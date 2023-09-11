import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Length } from 'class-validator';

@ObjectType()
export class HaulingOriginDistrict {
  @Field()
  id!: number;
  @Field()
  state!: string;
  @Field()
  originId!: number;

  @Field(() => String, { nullable: true })
  county: string | null = null;
  @Field(() => String, { nullable: true })
  city: string | null = null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  taxDistrictId?: number | null;
}

@InputType()
export class HaulingOriginDistrictInput {
  @Length(0, 200)
  @Field()
  state!: string;

  @Length(0, 200)
  @Field(() => String, { nullable: true })
  city!: string | null;

  @Length(0, 200)
  @Field(() => String, { nullable: true })
  county!: string | null;

  @Field(() => Int, { nullable: true, defaultValue: null })
  taxDistrictId?: number | null;
}
