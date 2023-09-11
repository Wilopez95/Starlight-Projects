import castArray from 'lodash/castArray.js';

import MqSender from '../sender.js';

import { getScopedContextModels } from '../../../utils/getScopedModels.js';

import { AMQP_QUEUE_PUBLISH_MASTER_ROUTE } from '../../../config.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { auto, masterRouteIds }) => {
  ctx.logger.debug(masterRouteIds, `generateDailyRoutes->publisher->templates`);

  const { MasterRoute } = getScopedContextModels(ctx);

  const masterRouteIdsArray = castArray(masterRouteIds);

  await Promise.all(
    masterRouteIdsArray.map(
      async masterRouteId =>
        await mqSender
          .sendTo(ctx, AMQP_QUEUE_PUBLISH_MASTER_ROUTE, {
            auto,
            masterRouteId,
          })
          .catch(async error => await MasterRoute.finishPublish(error, masterRouteId)),
    ),
  );
  ctx.logger.info('Queued generation of daily routes');
};
