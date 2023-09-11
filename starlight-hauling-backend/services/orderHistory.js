import groupBy from 'lodash/groupBy.js';
import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';

import OrderRepo from '../repos/order.js';
import WorkOrderRepo from '../repos/workOrder.js';
import MediaFileRepository from '../repos/mediaFile.js';

import { mathRound2 } from '../utils/math.js';
import { camelCaseKeys } from '../utils/dbHelpers.js';

import ApiError from '../errors/ApiError.js';

import fieldToLinkedTableMap from '../consts/fieldToLinkedTableMap.js';
import { EVENT_TYPE } from '../consts/historicalEventType.js';
import { populateUserNames } from './ums.js';
import { getOrderPaymentsHistory } from './billing.js';
import { pricingGetOrderHistory } from './pricing.js';

const HISTORICAL_ORDER_ENTITY = {
  order: 'ORDER',
  lineItem: 'LINE_ITEM',
  thresholdItem: 'THRESHOLD_ITEM',
  workOrder: 'WORK_ORDER',
  mediaFile: 'MEDIA_FILE',
  payment: 'PAYMENT',
};

const getDeltaByAttributes = (attrs, newObj, prevObj) =>
  attrs
    .map(attr => ({
      attribute: attr,
      newValue: newObj.eventType === EVENT_TYPE.deleted ? null : newObj[attr],
      previousValue:
        !prevObj ||
        prevObj.eventType === EVENT_TYPE.deleted ||
        newObj.eventType === EVENT_TYPE.created
          ? null
          : prevObj[attr],
    }))
    .filter(item => String(item.newValue) !== String(item.previousValue));

const extraHistoricalFields = [
  'id',
  'originalId',
  'eventType',
  'userId',
  'traceId',
  'createdAt',
  'updatedAt',
  'orderId',
  'workOrderId',
  'customer',
  'creditCard',
];

// it works for 3 repos since fieldToLinkedTableMap covers field-table mapping
const getTableNameByEntityType = attribute =>
  OrderRepo.getHistoricalTableName(fieldToLinkedTableMap[attribute]);

const getEntityColumns = items =>
  Object.keys(items[0]).filter(key => !extraHistoricalFields.includes(key));

const getNecessaryColumns = entityType => {
  let columns = [];
  switch (entityType) {
    case HISTORICAL_ORDER_ENTITY.lineItem: {
      columns = ['billableLineItemId'];
      break;
    }
    case HISTORICAL_ORDER_ENTITY.thresholdItem: {
      columns = ['thresholdId'];
      break;
    }
    default: {
      break;
    }
  }
  return columns;
};

const mapHistoricalRecord = ({ getDeltaByAttributesForItems, entityType, items, item, i }) => ({
  id: item.id,
  originalId: item.originalId,
  entityType,
  eventType: item.eventType,
  timestamp: new Date(item.createdAt).toUTCString(),
  userId: item.userId,

  changes: getDeltaByAttributesForItems(item, items[i + 1]),
  necessaryFields: pick(item, getNecessaryColumns(entityType)),
});

const getComparedSingleEntityRecords = (items, entityType) => {
  const getDeltaByAttributesForItems = getDeltaByAttributes.bind(null, getEntityColumns(items));
  return items.map((item, i) =>
    mapHistoricalRecord({ entityType, getDeltaByAttributesForItems, items, item, i }),
  );
};

const getComparedMultiEntitiesRecords = (allItems, entityType) => {
  const getDeltaByAttributesForItems = getDeltaByAttributes.bind(null, getEntityColumns(allItems));
  const groupedItems = groupBy(allItems, 'originalId');

  return Object.values(groupedItems).flatMap(items =>
    items.map((item, i) =>
      mapHistoricalRecord({ entityType, getDeltaByAttributesForItems, items, item, i }),
    ),
  );
};

const getDeltaByPaymentAttributes = (attrs, newObj, prevObj) =>
  attrs
    .map(attr => ({
      attribute: attr,
      newValue: newObj ? newObj[attr] : null,
      previousValue: prevObj[attr] ?? null,
    }))
    .filter(item => item.newValue != null && String(item.newValue) !== String(item.previousValue));

const getComparedPaymentsHistoricalItems = (items, entityType) => {
  const getDeltaByAttributesForItems = getDeltaByPaymentAttributes.bind(
    null,
    getEntityColumns(items),
  );

  // group by payment
  const groupedItems = groupBy(items, 'originalId');

  const populatedFields = ['customerId', 'creditCardId'];
  const basicMapFields = camelCaseKeys;

  return Object.values(groupedItems).flatMap(paymentItems => {
    const prevObjAcc = {};
    return paymentItems.map(item => {
      const changes = getDeltaByAttributesForItems(item, prevObjAcc);
      Object.assign(
        prevObjAcc,
        changes.reduce((obj, { attribute, newValue }) => {
          obj[attribute] = newValue;
          return obj;
        }, {}),
      );
      changes
        .filter(({ attribute, newValue }) => populatedFields.includes(attribute) && newValue)
        .forEach(change => {
          const field = change.attribute.slice(0, -2); // drop Id suffix
          change.populatedValues = {
            newValue: Array.isArray(item[field]) // joined tables resulted as array
              ? basicMapFields(item[field][0])
              : change.newValue,
            previousValue: change.previousValue,
          };
        });

      return {
        id: item.id,
        originalId: item.originalId,
        entityType,
        eventType: item.eventType,
        timestamp: new Date(item.createdAt).toUTCString(),

        userId: item.userId,

        paymentId: item.originalId,
        orderId: item.orderId,

        changes,
      };
    });
  });
};

export const getHistoricalRecords = async (ctx, orderId) => {
  const { schemaName } = ctx.state.user;
  const { knex } = OrderRepo;

  // TODO: extract it into repo queries
  const orders = await pricingGetOrderHistory(ctx, { data: { id: orderId } });

  if (!orders?.length) {
    throw ApiError.notFound(`None historical records found for Order with id ${orderId}`);
  }

  // TODO: extract it into repo queries
  // pre-pricing service code:
  // const [lineItems, thresholdItems] = await Promise.all([
  //  knex(LineItemRepo.getHistoricalTableName()).withSchema(schemaName).where({ orderId }).select('*').orderBy('id', 'desc'),
  //  knex(ThresholdItemRepo.getHistoricalTableName()).withSchema(schemaName).where({ orderId }).select('*').orderBy('id', 'desc'),
  // ]);

  let workOrders;
  let mediaFiles;
  const [{ workOrderId } = {}] = orders;
  if (workOrderId) {
    // TODO: extract it into repo queries
    [workOrders, mediaFiles] = await Promise.all([
      knex(WorkOrderRepo.getHistoricalTableName())
        .withSchema(schemaName)
        .where({ originalId: workOrderId })
        .select('*')
        .orderBy('id', 'desc'),
      knex(MediaFileRepository.getHistoricalTableName())
        .withSchema(schemaName)
        .where({ workOrderId })
        .select('*')
        .orderBy('id', 'desc'),
    ]);
  }

  // compare prev & new values of all order-related entities
  const comparedOrders = getComparedSingleEntityRecords(orders, HISTORICAL_ORDER_ENTITY.order);
  // pre-pricing service code:
  // const comparedLineItems = lineItems?.length ? getComparedMultiEntitiesRecords(lineItems, HISTORICAL_ORDER_ENTITY.lineItem) : [];
  // const comparedThresholdItems = thresholdItems?.length
  //  ? getComparedMultiEntitiesRecords(thresholdItems, HISTORICAL_ORDER_ENTITY.thresholdItem)
  //  : [];

  let comparedWorkOrders = [];
  let comparedMediaFiles = [];
  if (workOrders?.length) {
    comparedWorkOrders = getComparedSingleEntityRecords(
      workOrders,
      HISTORICAL_ORDER_ENTITY.workOrder,
    );
    if (mediaFiles?.length) {
      comparedMediaFiles = getComparedMultiEntitiesRecords(
        mediaFiles,
        HISTORICAL_ORDER_ENTITY.mediaFile,
      );
    }
  }

  const { payments, invoiceId } = (await getOrderPaymentsHistory(ctx, { orderId })) || {};
  const comparedPayments = payments?.length
    ? getComparedPaymentsHistoricalItems(payments, HISTORICAL_ORDER_ENTITY.payment)
    : [];

  const resultingItems = [
    ...comparedOrders,
    // ...comparedLineItems,
    // ...comparedThresholdItems,
    ...comparedWorkOrders,
    ...comparedMediaFiles,
    ...comparedPayments,
  ]
    .filter(({ changes }) => changes?.length)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // populate linked historical records
  const numericFields = ['quantity', 'price', 'limit'];
  // TODO: extract it into repo queries
  const getHistoricalRecord = (attribute, id) =>
    id
      ? knex(getTableNameByEntityType(attribute)).withSchema(schemaName).where({ id }).first()
      : id;

  const populateAttributeValue = async (entityType, change) => {
    const { attribute, newValue, previousValue } = change;
    if (!attribute.endsWith('Id')) {
      const s = attribute.toLowerCase();
      if (
        numericFields.includes(attribute) ||
        s.endsWith('total') ||
        s.endsWith('price') ||
        s.endsWith('amount') ||
        s.endsWith('balance')
      ) {
        change.newValue = newValue ? mathRound2(Number(newValue || 0)) : newValue;
        change.previousValue = previousValue
          ? mathRound2(Number(previousValue || 0))
          : previousValue;
      }
    } else if (
      entityType === HISTORICAL_ORDER_ENTITY.order
        ? fieldToLinkedTableMap[attribute]
        : [HISTORICAL_ORDER_ENTITY.lineItem, HISTORICAL_ORDER_ENTITY.thresholdItem].includes(
            entityType,
          )
      // since payments resolved in another way (other db)
    ) {
      change.populatedValues = { newValue, previousValue };
      if (newValue === previousValue) {
        const value = await getHistoricalRecord(attribute, newValue);
        change.populatedValues.newValue = value;
        change.populatedValues.previousValue = value;
      } else {
        change.populatedValues.newValue = await getHistoricalRecord(attribute, newValue);
        change.populatedValues.previousValue = await getHistoricalRecord(attribute, previousValue);
      }
    }
  };

  await Promise.all(
    resultingItems.flatMap(async item => {
      const { entityType, changes, necessaryFields } = item;
      // fe needs it to display for lineItem and threshold entites
      item.populatedFields = {};
      if (!isEmpty(necessaryFields)) {
        await Object.entries(necessaryFields).reduce(
          (promise, [attribute, id]) =>
            promise.then(async () => {
              item.populatedFields[attribute] = await getHistoricalRecord(attribute, id);
            }),
          Promise.resolve(),
        );
      }
      delete item.necessaryFields;

      Promise.all(changes.map(populateAttributeValue.bind(null, entityType)));
    }),
  );

  const resultObj = groupBy(resultingItems, 'timestamp');

  if (Object.keys(resultObj).length) {
    await populateUserNames(Object.values(resultObj).flat(), ctx);
  }

  if (invoiceId) {
    const [, [value] = []] =
      Object.entries(resultObj).find(([, arr]) =>
        arr.some(
          v =>
            v.entityType === HISTORICAL_ORDER_ENTITY.order &&
            v.changes.some(
              change => change.attribute === 'status' && change.newValue === 'invoiced',
            ),
        ),
      ) || [];

    if (value) {
      // fictive history record to display 'invoice added'
      value.changes.push({
        newValue: invoiceId,
        previousValue: null,
        attribute: 'invoiceId',
      });
    }
  }

  return resultObj;
};
