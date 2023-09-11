import dateFns from 'date-fns';
import last from 'lodash/last.js';

import { DAILY_ROUTES_PUBLISH_MAX_OFFSET } from '../config.js';

import { DEFAULT_DAILY_ROUTES_PUBLISH_OFFSET } from '../consts/masterRoute.js';
import { getScopedContextModels } from './getScopedModels.js';
import { getWeekDay } from './dateTime.js';

export const gatherDailyRoutesData = async (
  ctx,
  { startGenerationDate, generationOffset, masterRoute },
) => {
  ctx.logger.info('gatherDailyRoutesData started');

  const { DailyRoute, WorkOrder } = getScopedContextModels(ctx);

  const { serviceItems, serviceDaysList: masterRouteServiceDays } = masterRoute;

  const allDaysOfPeriod = Array.from(Array(generationOffset)).map((_, idx) =>
    dateFns.addDays(startGenerationDate, idx),
  );

  const lastProcessedDate = last(allDaysOfPeriod);

  ctx.logger.debug(
    allDaysOfPeriod,
    `${generationOffset} days period from publishDate ${startGenerationDate} on master route ${masterRoute.id}`,
  );

  const workingDays = allDaysOfPeriod.filter(dayOfPeriod => {
    const day = getWeekDay(dayOfPeriod);

    if (masterRouteServiceDays.includes(day)) {
      return true;
    }
    return false;
  });

  ctx.logger.debug(workingDays, `days to generate daily routes on master route ${masterRoute.id}`);

  const daysWithServiceItemsPairs = workingDays.map(workingDay => {
    const day = getWeekDay(workingDay);

    const serviceItemsIdsAtCurrentDay = serviceItems
      .filter(({ serviceDaysOfWeek }) => Object.keys(serviceDaysOfWeek).map(Number).includes(day))
      .map(({ haulingId }) => haulingId);

    return [workingDay, serviceItemsIdsAtCurrentDay];
  });

  ctx.logger.debug(
    daysWithServiceItemsPairs,
    `days with corresponding service items for generation on master route ${masterRoute.id}`,
  );

  const existingEditedDailyRoutes = await DailyRoute.getAllBy({
    parentRouteId: masterRoute.id,
    serviceDateFrom: startGenerationDate,
    isEdited: true,
  });

  const serviceDatesToSkip = existingEditedDailyRoutes.map(route => route.serviceDate);

  const dailyRoutesTemplates = await Promise.all(
    daysWithServiceItemsPairs.map(async ([serviceDate, serviceItemsIds]) => {
      // don't create routes on days where already edited related daily routes exist
      if (
        serviceDatesToSkip.some(date => dateFns.differenceInCalendarDays(serviceDate, date) === 0)
      ) {
        ctx.logger.debug(
          `found edited daily route on date ${serviceDate} of master route ${masterRoute.id}`,
        );
        return null;
      }

      const workOrders = await WorkOrder.getByServiceItems(serviceItemsIds, {
        serviceDate,
      });

      const dailyRouteGeneralData = {
        name: `${masterRoute.name} - ${dateFns.format(serviceDate, 'yyyy-MM-dd')}`,
        serviceDate,
        truckId: masterRoute.truckId,
        driverId: masterRoute.driverId,
        businessUnitId: masterRoute.businessUnitId,
        parentRouteId: masterRoute.id,
        serviceItemsIds,
      };

      return {
        ...dailyRouteGeneralData,
        workOrderIds: workOrders.map(wo => wo.id),
      };
    }),
  );

  ctx.logger.debug(
    dailyRoutesTemplates,
    `daily routes data for generation from master route ${masterRoute.id}`,
  );

  return {
    masterRouteId: masterRoute.id,
    dailyRoutes: dailyRoutesTemplates.filter(Boolean),
    lastPublishedAt: lastProcessedDate,
  };
};

export const produceDailyRoutesData = async (ctx, { auto, masterRouteId }) => {
  const { MasterRoute } = getScopedContextModels(ctx);

  const masterRoute = await MasterRoute.getByIdWithRelations(masterRouteId);

  const { publishDate, lastPublishedAt } = masterRoute;

  const currentDate = dateFns.startOfDay(new Date());
  const maxGenerationOffset = Number(
    DAILY_ROUTES_PUBLISH_MAX_OFFSET ?? DEFAULT_DAILY_ROUTES_PUBLISH_OFFSET,
  );

  const startGenerationDate = auto ? lastPublishedAt : publishDate;
  let generationOffset;

  if (auto) {
    if (currentDate < lastPublishedAt) {
      const diff = dateFns.differenceInCalendarDays(currentDate, lastPublishedAt);

      generationOffset = diff >= maxGenerationOffset ? 0 : maxGenerationOffset - diff;
    } else {
      generationOffset = maxGenerationOffset;
    }
  } else {
    generationOffset = maxGenerationOffset;
  }

  if (!generationOffset) {
    ctx.logger.warn('No daily routes will be generated for master route', masterRoute.id);

    return {
      masterRouteId: masterRoute.id,
      dailyRoutes: [],
      lastPublishedAt,
    };
  }

  const dailyRoutesData = await gatherDailyRoutesData(ctx, {
    startGenerationDate,
    generationOffset,
    masterRoute,
  });

  return dailyRoutesData;
};
