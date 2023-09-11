import { InputType, Field, ObjectType } from 'type-graphql';
import { Length } from 'class-validator';

@ObjectType()
export class CustomerAddress {
  @Length(0, 200)
  @Field({ defaultValue: '' })
  addressLine1?: string;

  @Length(0, 200)
  @Field({ defaultValue: '' })
  addressLine2?: string;

  @Length(0, 100)
  @Field({ defaultValue: '' })
  city?: string;

  @Length(0, 100)
  @Field({ defaultValue: '' })
  state?: string;

  @Length(0, 50)
  @Field({ defaultValue: '' })
  zip?: string;
}

@InputType()
export class CustomerAddressInput {
  @Length(0, 200)
  @Field({ defaultValue: '' })
  addressLine1?: string;

  @Length(0, 200)
  @Field({ defaultValue: '' })
  addressLine2?: string;

  @Length(0, 100)
  @Field({ defaultValue: '' })
  city?: string;

  @Length(0, 100)
  @Field({ defaultValue: '' })
  state?: string;

  @Length(0, 50)
  @Field({ defaultValue: '' })
  zip?: string;
}
