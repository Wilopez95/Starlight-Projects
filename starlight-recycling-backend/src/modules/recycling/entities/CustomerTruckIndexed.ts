import { Field, ObjectType } from 'type-graphql';
import { defaultsDeep } from 'lodash';
import CustomerTruck from './CustomerTruck';
import { ElasticSearch } from '../decorators/ElasticSearch';
import { HighlightScalar, HighlightType } from '../graphql/types/Highlight';
import commonElasticSearchIndexConfig from '../../../constants/commonElasticSearchIndexConfig';

@ObjectType()
@ElasticSearch({
  body: defaultsDeep(
    {
      mappings: {
        properties: {
          emptyWeight: {
            type: 'double',
          },
        },
      },
    },
    commonElasticSearchIndexConfig,
  ),
})
export default class CustomerTruckIndexed extends CustomerTruck {
  constructor(customerTruck?: CustomerTruck) {
    super();

    if (customerTruck) {
      Object.assign(this, customerTruck);
    }
  }

  @Field(() => HighlightScalar, { defaultValue: null })
  highlight: HighlightType | null = null;
}
