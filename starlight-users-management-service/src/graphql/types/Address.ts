import { InputType, Field, ObjectType } from 'type-graphql';
import { Length } from 'class-validator';

@ObjectType()
export class Address {
  @Length(0, 200)
  @Field()
  addressLine1!: string;

  @Length(0, 200)
  @Field({ nullable: true })
  addressLine2?: string;

  @Length(0, 100)
  @Field()
  city!: string;

  @Length(0, 100)
  @Field()
  state!: string;

  @Field()
  zip!: string;

  @Field({ nullable: true })
  region?: string;
}

@InputType()
export class AddressInput {
  @Length(0, 200)
  @Field()
  addressLine1!: string;

  @Length(0, 200)
  @Field({ nullable: true })
  addressLine2?: string;

  @Length(0, 100)
  @Field()
  city!: string;

  @Length(0, 100)
  @Field()
  state!: string;

  @Field()
  zip!: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  id?: number;
}
