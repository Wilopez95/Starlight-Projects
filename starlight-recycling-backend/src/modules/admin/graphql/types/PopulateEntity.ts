import { InputType, Field } from 'type-graphql';

@InputType()
export class PopulateEntityEvent {
  @Field(() => String, { description: 'Recycling Facility SRN, example: "srn:acme:recycling:1"' })
  resource!: string;

  @Field(() => String, { description: 'name of the entity to populate into ElasticSearch' })
  name!: string;

  @Field(() => Boolean, { description: 'force reindex without checking if mapping has changed' })
  forceReindex!: boolean;
}
