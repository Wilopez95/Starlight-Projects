import { InputType, Field } from 'type-graphql';

@InputType()
export default class PaginationInput {
  @Field()
  page!: number;
  @Field()
  perPage!: number;
}
