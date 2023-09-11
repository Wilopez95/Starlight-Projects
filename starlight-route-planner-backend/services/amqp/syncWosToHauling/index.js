import partition from 'lodash/partition.js';
import { getScopedContextModels } from '../../../utils/getScopedModels.js';

import { publisher as independentWosPublisher } from './independentWosPublisher.js';
import { publisher as subscriptionWosPublisher } from './subscriptionWosPublisher.js';

export const syncWosToHauling = async (ctx, workOrders) => {
  const { DailyRoute } = getScopedContextModels(ctx);
  const workOrdersArray = Array.isArray(workOrders) ? workOrders : [workOrders];

  const workOrdersDataToSync = await Promise.all(
    workOrdersArray.map(async workOrder => {
      const dailyRoute = await DailyRoute.getById(workOrder.dailyRouteId, [
        'driverName',
        'truckId',
      ]);

      return {
        ...workOrder,
        id: workOrder.workOrderId,
        driverName: dailyRoute?.driverName || null,
        truckNumber: dailyRoute?.truckId || null,
      };
    }),
  );

  const [independentWos, subscriptionWos] = partition(workOrdersDataToSync, wo => wo.isIndependent);

  await Promise.all([
    independentWosPublisher(ctx, { data: independentWos }),
    subscriptionWosPublisher(ctx, { data: subscriptionWos }),
  ]);
};
