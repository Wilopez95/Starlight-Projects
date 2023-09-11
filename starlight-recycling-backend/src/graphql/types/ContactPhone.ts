import { registerEnumType, InputType, Field, ObjectType } from 'type-graphql';
import { Length } from 'class-validator';

export enum ContactPhoneType {
  MAIN = 'main',
  HOME = 'home',
  WORK = 'work',
  CELL = 'cell',
  PAGER = 'pager',
  FAX = 'fax',
  OTHER = 'other',
}

registerEnumType(ContactPhoneType, { name: 'ContactPhoneType' });

@ObjectType()
export class ContactPhone {
  @Field(() => ContactPhoneType)
  type!: ContactPhoneType;

  @Field(() => String, { defaultValue: '' })
  number = '';

  @Field(() => String, { defaultValue: '' })
  extension = '';
}

@InputType()
export class ContactPhoneInput {
  @Field(() => ContactPhoneType)
  type!: ContactPhoneType;

  @Length(1, 100)
  @Field(() => String, { defaultValue: '' })
  number = '';

  @Length(0, 10)
  @Field(() => String, { defaultValue: '' })
  extension = '';
}
