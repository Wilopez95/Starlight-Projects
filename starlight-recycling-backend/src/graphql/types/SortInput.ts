import { InputType, Field } from 'type-graphql';

@InputType()
export default class SortInput<T> {
  @Field(() => String)
  field!: keyof T & string;
  @Field()
  order!: 'ASC' | 'DESC';
}
