import { ObjectType, Field, InputType } from 'type-graphql';

@InputType()
export class CountyAtCoordinatesInput {
  @Field()
  lng!: number;

  @Field()
  lat!: number;
}

@ObjectType()
export class CountyAtCoordinates {
  @Field()
  county!: string;
}
