import WorkOrderMapper from '../../mappers/WorkOrderMapper.js';
import ServiceItemMapper from '../../mappers/ServiceItemMapper.js';
import HaulingRoutePlannerEntitiesMapper from '../../mappers/HaulingRoutePlannerEntitiesMapper.js';
import WorkOrderMediaMapper from '../../mappers/WorkOrderMediaMapper.js';
import RecyclingOrderMapper from '../../mappers/RecyclingOrderMapper.js';

import knex from '../../db/connection.js';

import { getScopedContextModels } from '../../utils/getScopedModels.js';
import { detectServiceItemsRouteChanges } from '../../utils/serviceItemMasterRouteHelper.js';
import { logger } from '../../utils/logger.js';
import { SYNC_WOS_MEDIA_ACTION } from '../../consts/workOrderMedia.js';

const logError = logger.error.bind(logger);

export const createTenant = async ({ id, name, legalName }) => {
  const { Tenant } = getScopedContextModels();

  try {
    await Tenant.createOne({ data: { id, name, legalName }, fields: [] });
    logger.info(`Created tenant ${name}`);
  } catch (error) {
    logger.error(error, 'Error creating tenant');
  }
};

export const updateCustomerInfo = async (ctx, data) => {
  ctx.logger.debug(data, `Update Work Order with new Customer data => `);

  const { id: customerId, contactId: jobSiteContactId, mainPhoneNumber: phoneNumber } = data || {};

  const { WorkOrder } = getScopedContextModels(ctx);
  await WorkOrder.patchBy({ condition: { customerId, jobSiteContactId }, data: { phoneNumber } });
};

export const updateRoutesWithDriver = async (ctx, data) => {
  ctx.logger.debug(data, `Update Routes with new Driver data => `);

  const { DailyRoute, MasterRoute } = getScopedContextModels(ctx);

  const trx = await knex.transaction();

  try {
    await Promise.all([
      DailyRoute.updateViolationsWithDriverInfo(data, trx),
      MasterRoute.updateViolationsWithDriverInfo(data, trx),
    ]);

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(data, 'Failed to update related routes with driver info from hauling');
    ctx.logger.error(error);
  }
};

export const updateRoutesWithTruck = async (ctx, data) => {
  ctx.logger.debug(data, `Update Routes with new Truck data => `);

  const { DailyRoute, MasterRoute } = getScopedContextModels(ctx);

  const trx = await knex.transaction();

  try {
    await Promise.all([
      DailyRoute.updateViolationsWithTruckInfo(data, trx),
      MasterRoute.updateViolationsWithTruckInfo(data, trx),
    ]);

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(data, 'Failed to update related routes with truck info from hauling');
    ctx.logger.error(error);
  }
};

export const upsertJobSite = async (ctx, data) => {
  ctx.logger.debug(data, `Sync Job Sites from Hauling started => `);

  if (data.schemaName) {
    ctx.schemaName = data.schemaName;
  }
  const { JobSite } = getScopedContextModels(ctx);
  const jobSiteToUpsert = HaulingRoutePlannerEntitiesMapper.mapJobSite(data);

  await JobSite.upsert(jobSiteToUpsert).catch(logError);
};

export const upsertWorkOrder = isIndependent => async (ctx, data) => {
  ctx.logger.debug(data, `Sync Work Orders from Hauling started => `);

  if (data.schemaName) {
    ctx.schemaName = data.schemaName;
  }

  const { WorkOrder } = getScopedContextModels(ctx);

  const mapWorkOrders = isIndependent
    ? WorkOrderMapper.mapIndependentWorkOrdersFromHauling
    : WorkOrderMapper.mapSubscriptionWorkOrdersFromHauling;

  const mappedWos = mapWorkOrders(data);
  await WorkOrder.upsertWosAndSyncToHauling(mappedWos);
};

export const upsertServiceItems = async (ctx, data) => {
  ctx.logger.debug(data, `Sync Update Service Items from Hauling started => `);

  const { ServiceItem, MasterRoute } = getScopedContextModels(ctx);
  const serviceItems = ServiceItemMapper.mapServiceItemsFromHauling(data.serviceItems);

  const { businessUnitId } = serviceItems[0];

  const existingItems = await ServiceItem.getByIds(serviceItems.map(({ id }) => id));

  const { relationUpdates, serviceItemsToUpsert } = detectServiceItemsRouteChanges(
    existingItems,
    serviceItems,
  );

  ctx.logger.debug(relationUpdates, 'Sync Update Service Items detected changes => ');

  const updatedServiceItems = Array.from(serviceItemsToUpsert);

  const trx = await knex.transaction();

  try {
    // keep it separate, and don't use Promise.all,
    // since master route updates should be done after service items are updated/inserted
    if (updatedServiceItems.length) {
      await ServiceItem.upsertMany({ data: updatedServiceItems }, trx);
    }

    await MasterRoute.registerServiceItemsUpdatesFromHauling(
      { businessUnitId, incomingChanges: relationUpdates },
      trx,
    );

    await trx.commit();
  } catch (error) {
    await trx.rollback();

    ctx.logger.warn(updatedServiceItems, 'Failed to process Service Items updates from hauling');
    ctx.logger.error(error);
  }
};

export const softDeleteWorkOrder = async (ctx, data) => {
  ctx.logger.debug(data, `Delete Work Orders started => `);

  const { WorkOrder } = getScopedContextModels(ctx);

  const WOsToDelete = WorkOrderMapper.mapWorkOrdersToSoftDelete(data);
  const deleteWOsPromises = WOsToDelete.map(workOrder => WorkOrder.softDelete(workOrder));

  await Promise.all(deleteWOsPromises).catch(logError);
};

export const syncWosMedia = async (ctx, data) => {
  ctx.logger.debug(data, `Sync Update Work Orders media from Hauling started => `);

  const { WorkOrderMedia, WorkOrder } = getScopedContextModels(ctx);
  const { media, action, isIndependent } = data;

  if (action === SYNC_WOS_MEDIA_ACTION.delete) {
    const idsToDelete = media.map(({ id }) => id);
    await WorkOrderMedia.deleteByIds(idsToDelete);
  }

  if (action === SYNC_WOS_MEDIA_ACTION.create) {
    const wosMediaToUpsert = await WorkOrderMediaMapper.mapHaulingWorkOrderMedia({
      media,
      isIndependent,
      model: WorkOrder,
    });

    await WorkOrderMedia.upsert(wosMediaToUpsert).catch(logError);
  }
};

export const attachWeightTicketFromRecyclingToDailyRoute = async (ctx, data) => {
  ctx.logger.debug(data, 'Attach recycling weightTicket to DailyRoute =>>>');
  ctx.schemaName = data.schemaName;

  const { WeightTicket } = getScopedContextModels(ctx);

  const IS_AUTO_ATTACH_FROM_RECYCLING = true;
  const weightTicket = RecyclingOrderMapper.mapRecyclingOrderToWeightTicket(data);
  const weightTicketMedia = RecyclingOrderMapper.mapRecyclingOrderToWeightTicketMedia(data);

  await WeightTicket.create(weightTicket, weightTicketMedia, IS_AUTO_ATTACH_FROM_RECYCLING);
};
