import { Field, ObjectType, Float } from 'type-graphql';
import { omit, sumBy } from 'lodash';
import { defaultsDeep } from 'lodash';

import Order, { OrderType } from './Order';
import { ElasticSearch } from '../decorators/ElasticSearch';
import { HighlightScalar, HighlightType } from '../graphql/types/Highlight';
import commonElasticSearchIndexConfig from '../../../constants/commonElasticSearchIndexConfig';

@ObjectType()
@ElasticSearch({
  includeRelations: [
    'customerTruck',
    'nonCommercialTruck',
    'materialsDistribution',
    'miscellaneousMaterialsDistribution',
  ],
  body: defaultsDeep(
    {
      settings: {
        index: {
          number_of_shards: 3,
        },
      },
      mappings: {
        properties: {
          initialOrderTotal: {
            type: 'double',
          },
          weightIn: {
            type: 'double',
          },
          weightOut: {
            type: 'double',
          },
          netWeight: {
            type: 'double',
          },
          grandTotal: {
            type: 'double',
          },
          beforeTaxesTotal: {
            type: 'double',
          },
          taxTotal: {
            type: 'double',
          },
          billableItems: {
            properties: {
              quantity: {
                type: 'double',
              },
              price: {
                type: 'double',
              },
            },
          },
          materialsDistribution: {
            properties: {
              value: {
                type: 'double',
              },
            },
          },
          miscellaneousItemsDistribution: {
            properties: {
              quantity: {
                type: 'double',
              },
            },
          },
          customerTruck: {
            properties: {
              emptyWeight: {
                type: 'double',
              },
            },
          },
          arrivedAt: {
            type: 'date',
          },
          departureAt: {
            type: 'date',
          },
          nonCommercialTruck: {
            properties: {
              licensePlate: {
                type: 'keyword',
              },
            },
          },
        },
      },
    },
    commonElasticSearchIndexConfig,
  ),
})
export default class OrderIndexed extends Order {
  constructor(order?: Order) {
    super();

    if (order) {
      Object.assign(this, omit(order, ['__userInfo']));
      let graded = null;

      if (order.type === OrderType.DUMP) {
        graded =
          sumBy(order.materialsDistribution, function (o) {
            return typeof o.value === 'string' ? parseInt(o.value, 10) : o.value;
          }) === 100;
      }
      this.graded = graded;

      if (order.weightIn) {
        this.netWeight = Math.abs(order.weightIn - (order.weightOut || 0));
      }

      this.hasWeightTicket = !!order.weightTicketPrivateUrl;
    }
  }

  @Field(() => Boolean, { defaultValue: null })
  hasWeightTicket: boolean | null = null;

  @Field(() => HighlightScalar, { defaultValue: null })
  highlight: HighlightType | null = null;

  @Field(() => Float, { defaultValue: null })
  netWeight: number | null = null;

  @Field(() => Boolean, { defaultValue: null })
  graded: boolean | null = null;
}
