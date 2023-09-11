import { produceDailyRoutesData } from '../../../utils/dailyRoutesUtils.js';
import { getScopedContextModels } from '../../../utils/getScopedModels.js';

import { executeForAllTenants } from '../executeForAllTenants.js';
import { publisher as publishMasterRoutes } from './publisher.js';

export const masterRouteSubscriber = async (ctx, { auto, masterRouteId }) => {
  ctx.logger.debug(`masterRouteSubscriber start auto: ${auto}, masterRouteId: ${masterRouteId}`);

  const { DailyRoute, MasterRoute } = getScopedContextModels(ctx);

  const {
    masterRouteId: id,
    dailyRoutes,
    lastPublishedAt,
  } = await produceDailyRoutesData(ctx, {
    auto,
    masterRouteId,
  });

  try {
    // need to retain sync manner, because of color calculation dependent on all previously created daily routes
    // probably could improve this in future
    for (const dailyRouteTemplate of dailyRoutes) {
      const { businessUnitId, name, serviceDate, parentRouteId, truckId, driverId, workOrderIds } =
        dailyRouteTemplate;

      if (workOrderIds.length) {
        const dailyRoute = await DailyRoute.create(businessUnitId, {
          name,
          serviceDate,
          parentRouteId,
          truckId,
          driverId,
          workOrderIds,
          autoColor: true,
        });

        ctx.logger.debug(dailyRoute, `Generated daily route from master route ${masterRouteId}`);
      } else {
        ctx.logger.error(
          `NOTE =>
                    Skipping daily route generation on service date ${serviceDate} from master route ${masterRouteId}.
                    No related workOrders are found`,
        );
      }
    }

    await MasterRoute.finishPublish(null, id, lastPublishedAt);

    ctx.logger.debug(
      `lastPublishedAt date set to ${lastPublishedAt} for master route ${masterRouteId}`,
    );
  } catch (e) {
    await MasterRoute.finishPublish(e, id);
  }

  ctx.logger.debug(`masterRouteSubscriber end auto: ${auto}, masterRouteId: ${masterRouteId}`);
};

export const generateDailyRoutesFromMasterRoutesSubscriber = executeForAllTenants(async ctx => {
  ctx.logger.debug(
    `cron job processing republishMasterRoutesSubscriber start for schema: ${ctx.schemaName}`,
  );

  const { MasterRoute } = getScopedContextModels(ctx);

  const masterRoutes = await MasterRoute.getAll({
    condition: { published: true },
    fields: ['id'],
  });

  publishMasterRoutes(ctx, {
    auto: true,
    masterRouteIds: masterRoutes.map(masterRoute => masterRoute.id),
  });

  ctx.logger.debug(
    `Queued cron job processing republishMasterRoutesSubscriber for schema: ${ctx.schemaName}`,
  );
}, 'generateDailyRoutesFromMasterRoutesSubscriber');
