import { differenceInMinutes, differenceInCalendarDays } from 'date-fns';

import ThresholdRepo from '../../repos/threshold.js';
import WorkOrderRepo from '../../repos/v2/workOrder.js';

import ApiError from '../../errors/ApiError.js';

import { THRESHOLD_TYPE } from '../../consts/thresholdTypes.js';
import { WEIGHT_UNIT } from '../../consts/workOrder.js';
import { SORT_ORDER } from '../../consts/sortOrders.js';
import actualizeThreshold from './actualizeThreshold.js';

const calculateThresholds = async (ctx, { order, workOrder }, trx) => {
  ctx.logger.debug(`calculateThresholds->order: ${JSON.stringify(order, null, 2)}`);
  ctx.logger.debug(`calculateThresholds->workOrder: ${JSON.stringify(workOrder, null, 2)}`);

  const {
    arriveOnSiteDate,
    startServiceDate,
    weight,
    weightUnit,
    pickedUpEquipmentItem,
    pickedUpEquipmentItemDate,
    date = new Date(),
  } = workOrder;

  if (
    !(
      +!!(arriveOnSiteDate && startServiceDate) +
      +!!(weight && weightUnit) +
      +!!(pickedUpEquipmentItem && pickedUpEquipmentItemDate)
    )
  ) {
    throw ApiError.preconditionFailed('Insufficient data to start thresholds calculation');
  }

  const woRepo = WorkOrderRepo.getInstance(ctx.state);
  const thresholdRepo = ThresholdRepo.getInstance(ctx.state);

  try {
    const {
      businessUnit: { id: businessUnitId },
      businessLine: { id: businessLineId },
      thresholds: existingThresholds = [],
    } = order;
    const thresholds = await thresholdRepo.getAll({ condition: { businessLineId } }, trx);

    const resultingThresholds = [];
    let thresholdId;
    const { priceGroup, material, equipmentItem } = order;
    const {
      originalId: priceGroupId,
      overweightSetting,
      usageDaysSetting,
      demurrageSetting,
    } = priceGroup ?? {};
    const { originalId: materialId } = material ?? {};
    const { originalId: equipmentItemId } = equipmentItem ?? {};

    const upsertCondition = {
      existingThresholds,
      businessUnitId,
      businessLineId,
      priceGroupId,
      equipmentItemId,
      materialId,
    };

    // Demurrage in mins
    const demurrageThreshold = thresholds.find(({ type }) => type === THRESHOLD_TYPE.demurrage);
    thresholdId = demurrageThreshold?.id;

    if (
      arriveOnSiteDate &&
      startServiceDate
      // && (String(arriveOnSiteDate) !== String(wo.arriveOnSiteDate) ||
      // String(startServiceDate) !== String(wo.startServiceDate))
    ) {
      const diff = differenceInMinutes(new Date(startServiceDate), new Date(arriveOnSiteDate));

      // TODO: for the testing purposes only!
      // diff -= 15;

      if (diff > 0) {
        const setting = demurrageSetting;
        const obj = await actualizeThreshold(
          ctx,
          {
            ...upsertCondition,
            threshold: demurrageThreshold,
            currentValue: diff,
            thresholdId,
            setting,
            date,
            orderId: order.id,
          },
          trx,
        );

        obj && resultingThresholds.push(obj);
      }
    }

    // Overweight by tons (no threshold for yards)
    const overweightThreshold = thresholds.find(({ type }) => type === THRESHOLD_TYPE.overweight);
    thresholdId = overweightThreshold?.id;

    if (
      weight &&
      weightUnit === WEIGHT_UNIT.tons
      // && weight !== wo.weight
    ) {
      const setting = overweightSetting;
      const obj = await actualizeThreshold(
        ctx,
        {
          ...upsertCondition,
          threshold: overweightThreshold,
          currentValue: weight,
          thresholdId,
          setting,
          date,
          orderId: order.id,
        },
        trx,
      );

      obj && resultingThresholds.push(obj);
    }

    // Overused in days
    const usageDaysThreshold = thresholds.find(({ type }) => type === THRESHOLD_TYPE.usageDays);
    thresholdId = usageDaysThreshold?.id;

    if (
      pickedUpEquipmentItem &&
      pickedUpEquipmentItemDate
      // && (String(pickedUpEquipmentItem) !== String(wo.pickedUpEquipmentItem) ||
      // String(pickedUpEquipmentItemDate) !== String(wo.pickedUpEquipmentItemDate))
    ) {
      // seek prev WO with such dropped equipment
      const existingWo = await woRepo
        .getBy(
          {
            condition: { droppedEquipmentItem: pickedUpEquipmentItem },
            fields: ['droppedEquipmentItemDate'],
          },
          trx,
        )
        .orderBy('id', SORT_ORDER.desc);

      if (existingWo) {
        const diff = differenceInCalendarDays(
          new Date(pickedUpEquipmentItemDate),
          new Date(existingWo.droppedEquipmentItemDate),
        );
        if (diff > 0) {
          const setting = usageDaysSetting;
          const obj = await actualizeThreshold(
            ctx,
            {
              ...upsertCondition,
              threshold: usageDaysThreshold,
              currentValue: diff,
              thresholdId,
              setting,
              date,
              orderId: order.id,
            },
            trx,
          );

          obj && resultingThresholds.push(obj);
        }
      }
    }

    return resultingThresholds;
  } catch (error) {
    ctx.logger.error(error, `Error while calculating thresholds for an order with id ${order.id}`);
    throw error;
  }
};

export default calculateThresholds;
