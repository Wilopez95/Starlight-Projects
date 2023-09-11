/* eslint-disable @typescript-eslint/no-explicit-any */
import OrderHistory from '../../entities/OrderHistory';
import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { QueryContext } from '../../../../types/QueryContext';
import getContextualizedEntity from '../../../../utils/getContextualizedEntity';
import { HaulingHttpCrudService } from '../../../../graphql/createHaulingCRUDResolver';
import { HaulingOrderHttpService } from '../../../../services/core/haulingOrder';
import { isNumber, groupBy, isEqual, isNil } from 'lodash';
import BaseHistoryEntity from '../../../../entities/BaseHistoryEntity';
import Action from '../../../../entities/AuditEntityAction';
import { OrderHistoryScalar } from '../../../../graphql/types/OrderHistory';
import { OrderMaterialDistribution } from '../../entities/OrderMaterialDistribution';
import { OrderMiscellaneousMaterialDistribution } from '../../entities/OrderMiscellaneousMaterialDistribution';

enum ENTITY_TYPE {
  Order = 'ORDER',
}

const actionToEvent = {
  [Action.CREATE]: 'created',
  [Action.UPDATE]: 'edited',
  [Action.REMOVE]: 'deleted',
  [Action.UNKNOWN]: 'unknown',
};

export const POPULATED_FIELDS: Record<string, string> = {
  materialId: 'material',
  priceGroupId: 'priceGroup',
  originDistrictId: 'originDistrict',
  jobSiteId: 'jobSite',
  containerId: 'container',
  destinationId: 'destination',
  projectId: 'project',
};

// fields to track for changes https://starlightpro.atlassian.net/browse/REC-1661
const ORDER_HISTORY_COLUMNS = [
  ...Object.keys(POPULATED_FIELDS),
  'customerTruck',
  'PONumber',
  'WONumber',
  'note',
  'status',
  'arrivedAt',
  'departureAt',
  'weightIn',
  'weightOut',
  'materialsDistribution',
  'miscellaneousMaterialsDistribution',
  'images',
];

const EXTRA_HAULING_ORDER_FIELDS = [
  'arrivedAt',
  'departureAt',
  'customerTruck',
  'container',
  'weightIn',
  'weightOut',
  'PONumber',
  'WONumber',
  'materialsDistribution',
  'miscellaneousMaterialsDistribution',
  'images',
  'priceGroupId',
  'note',
  'projectId',
  'originDistrictId',
  'jobSiteId',
  'containerId',
  'destinationId',
];

const sortEntities = (i1: any, i2: any) => (i2?.uuid && i2?.uuid ? i1.uuid > i2.uuid : 0);

function getDeltaByAttributes(
  attrs: string[],
  newObject: BaseHistoryEntity,
  prevObject: BaseHistoryEntity | null,
) {
  return attrs
    .map((attr: string) => {
      const [newObj, prevObj] = [
        newObject?.data ? newObject.data : newObject,
        prevObject?.data ? prevObject.data : prevObject,
      ];
      const baseChanges = {
        attribute: attr,
        newValue: newObj.action === Action.REMOVE ? null : newObj[attr],
        previousValue:
          !prevObj || prevObj.action === Action.REMOVE || newObj.action === Action.CREATE
            ? null
            : prevObj[attr],
        populatedValues: undefined,
      };

      if (POPULATED_FIELDS[attr]) {
        return {
          ...baseChanges,
          populatedValues: {
            newValue: newObj.action === Action.REMOVE ? null : newObj?.[POPULATED_FIELDS[attr]],
            previousValue:
              !prevObj || prevObj.action === Action.REMOVE || newObj.action === Action.CREATE
                ? null
                : prevObj?.[POPULATED_FIELDS[attr]],
          },
        };
      }

      return baseChanges;
    })
    .filter((item) => {
      if (isNil(item.newValue) && isNil(item.previousValue)) {
        return false;
      }

      if (POPULATED_FIELDS[item.attribute] && !item.populatedValues) {
        return false;
      }

      if (item.newValue instanceof Object) {
        if (item.previousValue instanceof Object) {
          if (
            ['materialsDistribution', 'miscellaneousMaterialsDistribution'].includes(item.attribute)
          ) {
            item.previousValue.sort(sortEntities);
            item.newValue.sort(sortEntities);

            return item.newValue.some((value: any, i: number) => {
              const attr = item.attribute === 'materialsDistribution' ? 'value' : 'quantity';

              return value[attr] != item.previousValue?.[i][attr];
            });
          }

          if (item.attribute === 'images') {
            return item.newValue?.length !== item.previousValue?.length;
          }

          return !isEqual(item.newValue, item.previousValue);
        }

        return true;
      }

      return String(item.newValue) !== String(item.previousValue);
    })
    .map((item) => {
      switch (item.attribute) {
        case 'materialsDistribution':
          if (!item.previousValue) {
            return {
              ...item,
              newValue: item.newValue.filter(({ value }: OrderMaterialDistribution) => value > 0),
            };
          }

          return item;
        case 'miscellaneousMaterialsDistribution':
          if (!item.previousValue) {
            return {
              ...item,
              newValue: item.newValue.filter(
                ({ quantity }: OrderMiscellaneousMaterialDistribution) => quantity > 0,
              ),
            };
          }

          return item;
        default:
          return item;
      }
    });
}

const mapHistoricalRecord = ({
  getDeltaByAttributesForItems,
  entityType,
  items,
  item,
  i,
}: {
  getDeltaByAttributesForItems(a: BaseHistoryEntity, b: BaseHistoryEntity | null): any;
  entityType: ENTITY_TYPE;
  items: BaseHistoryEntity[];
  item: BaseHistoryEntity;
  i: number;
}) => {
  return {
    id: item.id,
    entityType,
    eventType: actionToEvent[item.action],
    timestamp: new Date(item.createdAt).toUTCString(),
    user: item.performedBy,

    changes: getDeltaByAttributesForItems(item, items[i + 1] || item),
  };
};

const TIME_DELAY = 60000; // 60 sec

const dateConverter = (date1: string, date2: string) => [
  new Date(date1).getTime(),
  new Date(date2).getTime(),
];

const groupByDateUtil = () => {
  let previousOrderChange = { timestamp: '', eventType: '', user: '' };

  return ({
    timestamp,
    eventType,
    user,
  }: {
    timestamp: string;
    eventType: string;
    user: string;
  }) => {
    if (!previousOrderChange.timestamp || previousOrderChange.user !== user) {
      previousOrderChange = {
        timestamp,
        eventType,
        user,
      };

      return timestamp;
    }

    const [time1, time2] = dateConverter(timestamp, previousOrderChange.timestamp);
    const difference = Math.abs(time1 - time2);

    // decrease number of repetitive/similar timestamps
    if (difference < TIME_DELAY && eventType === previousOrderChange.eventType) {
      return previousOrderChange.timestamp;
    }

    previousOrderChange = {
      timestamp,
      eventType,
      user,
    };

    return timestamp;
  };
};

@Resolver(() => OrderHistory)
export class OrderHistoryResolver {
  @Authorized()
  @Query(() => OrderHistoryScalar)
  async aggregatedOrderHistory(
    @Ctx() ctx: QueryContext,
    @Arg('orderId', () => Int) orderId: number,
  ): Promise<Record<any, OrderHistory>> {
    const orderHistory = {} as Record<any, OrderHistory>;

    const ContextualizedOrderHistory = getContextualizedEntity(OrderHistory)(ctx);
    const list = (await ContextualizedOrderHistory.find({
      where: {
        id: orderId,
      },
      order: {
        createdAt: 'DESC',
      },
    })) as OrderHistory[];

    if (!list) {
      throw new Error('No history for specified order was found.');
    }

    const { beforeHauling, afterHauling } = list.reduce(
      (res, curr) => {
        if (curr.data.haulingOrderId) {
          res.afterHauling.push(curr);
        } else {
          res.beforeHauling.push(curr);
        }

        return res;
      },
      { beforeHauling: [], afterHauling: [] } as Record<string, OrderHistory[]>,
    );

    const before = beforeHauling
      .map((item, i, items) =>
        mapHistoricalRecord({
          getDeltaByAttributesForItems: (next, previous) =>
            getDeltaByAttributes(ORDER_HISTORY_COLUMNS, next, previous),
          entityType: ENTITY_TYPE.Order,
          items,
          item,
          i,
        }),
      )
      .filter((item) => item.changes.length);

    const after = [beforeHauling[0], ...afterHauling]
      .map((item, i, items) =>
        mapHistoricalRecord({
          getDeltaByAttributesForItems: (next, previous) =>
            getDeltaByAttributes(EXTRA_HAULING_ORDER_FIELDS, next, previous),
          entityType: ENTITY_TYPE.Order,
          items,
          item,
          i,
        }),
      )
      .filter((item) => item.changes.length);
    after.shift(); // remove comparable [before] change

    const recyclingRawHistories = before.concat(after);

    const groupUtil = groupByDateUtil();
    const recyclingHistory = groupBy(recyclingRawHistories, groupUtil);
    Object.assign(orderHistory, recyclingHistory);

    const haulingOrderId = list.find(({ data }) => isNumber(data.haulingOrderId))?.data
      .haulingOrderId as number;

    try {
      if (haulingOrderId) {
        const auth = await HaulingHttpCrudService.getAuthorizationHeader(ctx);
        const res = await new HaulingOrderHttpService().getHistory(ctx, haulingOrderId, auth);

        // hauling order history comes after order completion (recycling side), therefore we'll get two equal timestamps
        for (const [timestamp, changes] of Object.entries(res.data)) {
          if (orderHistory[timestamp]) {
            const incrementedTimestamp = new Date(
              new Date(timestamp).getTime() + 1000,
            ).toUTCString();
            orderHistory[incrementedTimestamp] = changes;
          } else {
            orderHistory[timestamp] = changes;
          }
        }
      }
    } catch (e) {
      throw new Error(`Could not fetch order history. Error: ${e.message}`);
    }

    return orderHistory;
  }
}
