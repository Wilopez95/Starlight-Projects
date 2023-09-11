import { ObjectType, Field, InputType } from 'type-graphql';
import { GraphQLScalarType } from 'graphql';
import { ObjectLiteral } from 'typeorm';

export const ObjectLiteralScalar = new GraphQLScalarType({
  name: 'ObjectLiteralScalar',
  description: 'ObjectLiteralScalar',
  parseValue(value: ObjectLiteral): ObjectLiteral {
    return value; // get as is
  },
  serialize(value: ObjectLiteral): ObjectLiteral {
    return value; // send as is
  },
});

@InputType()
export class SearchBodyInput {
  @Field({ nullable: true })
  from?: number;

  @Field({ nullable: true })
  size?: number;

  @Field(() => ObjectLiteralScalar, { nullable: true })
  query?: ObjectLiteral;

  @Field(() => [ObjectLiteralScalar], { nullable: true })
  sort?: ObjectLiteral[];

  @Field(() => ObjectLiteralScalar, { nullable: true })
  highlight?: ObjectLiteral;

  @Field(() => ObjectLiteralScalar, { nullable: true })
  aggs?: ObjectLiteral;
}

@ObjectType()
export class SearchBody {
  @Field({ nullable: true })
  from?: number;

  @Field({ nullable: true })
  size?: number;

  @Field(() => ObjectLiteralScalar, { nullable: true })
  query?: ObjectLiteral;

  @Field(() => [ObjectLiteralScalar], { nullable: true })
  sort?: ObjectLiteral[];

  @Field(() => ObjectLiteralScalar, { nullable: true })
  highlight?: ObjectLiteral;

  @Field(() => ObjectLiteralScalar, { nullable: true })
  aggs?: ObjectLiteral;
}
