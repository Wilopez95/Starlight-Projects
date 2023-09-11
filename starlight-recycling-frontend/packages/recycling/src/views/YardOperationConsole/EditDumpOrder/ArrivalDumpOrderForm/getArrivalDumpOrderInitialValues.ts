import { omit, sum } from 'lodash-es';
import { prop } from 'lodash/fp';
import { GetOrderQuery } from '../../../../graphql/api';

export const getArrivalDumpOrderInitialValues = (order: GetOrderQuery['order']) => ({
  weightIn: order.weightIn,
  weightInType: order.weightInType,
  weightInSource: order.weightInSource,
  arrivedAt: order.arrivedAt,
  departureAt: order.departureAt || null,
  images: order.images?.map((im) => omit(im, '__typename')),
  materialsDistribution: order.materialsDistribution.map((m) => omit(m, '__typename')),
  materialsDistributionTotal: sum(order.materialsDistribution.map(prop('value'))),
  miscellaneousMaterialsDistribution: order.miscellaneousMaterialsDistribution.map((m) =>
    omit(m, '__typename'),
  ),
  billableItems: order.billableItems,
  weightScaleUom: order.weightScaleUom || null,
  licensePlate: order.nonCommercialTruck?.licensePlate,
});
