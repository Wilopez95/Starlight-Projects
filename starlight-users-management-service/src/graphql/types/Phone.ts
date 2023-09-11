import { registerEnumType, InputType, Field, ObjectType } from 'type-graphql';
import { Length } from 'class-validator';

export enum PhoneType {
  MAIN = 'MAIN',
  HOME = 'HOME',
  WORK = 'WORK',
  CELL = 'CELL',
  PAGER = 'PAGER',
  FAX = 'FAX',
  PHONE = 'PHONE',
  OTHER = 'OTHER',
}

registerEnumType(PhoneType, { name: 'PhoneType' });

@ObjectType()
export class Phone {
  @Field(() => PhoneType)
  type!: PhoneType;

  @Field(() => String)
  number = '';

  @Field(() => String)
  extension = '';

  @Field(() => Boolean)
  textOnly = false;
}

@InputType()
export class PhoneInput {
  @Field(() => PhoneType)
  type!: PhoneType;

  @Length(1, 100)
  @Field(() => String)
  number = '';

  @Length(0, 10)
  @Field(() => String, { defaultValue: '' })
  extension = '';

  @Field(() => Boolean, { defaultValue: false })
  textOnly = false;
}
