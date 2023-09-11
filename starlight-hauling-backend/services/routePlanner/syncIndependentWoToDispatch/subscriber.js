import { subHours, format, startOfDay, startOfToday } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import { publisher as syncFromDispatch } from '../syncIndependentWoFromDispatch/publisher.js';

import { randomArrayItem } from '../../../utils/arrays.js';

import { INDEPENDENT_WO_STATUS } from '../../../consts/independentWorkOrder.js';

const { zonedTimeToUtc } = dateFnsTz;
const equipments = [
  'fd342q4',
  'fd342q5',
  '421421',
  '421422',
  '001',
  '002',
  'g1',
  'g2',
  '05461.234',
];
const routes = [
  'Master Route #1',
  'Master Route #2',
  'Master Route #3',
  'Master Route #4',
  'Master Route #5',
  'Master Route #6',
  'Master Route #7',
  'Master Route #8',
  'Master Route #9',
];
const drivers = [
  'John Bo',
  'Harry Killiman',
  'Ozzy Lu',
  'Mary Smith',
  'Ben Harryson',
  'Steven Jackson',
];
const trucks = ['Truck #1', 'Truck #2', 'Truck #3', 'Truck #4', 'Truck #5', 'Truck #6'];
const comments = [...Array(10).fill(null), 'car accident on main road', 'high traffic'];
const cancellationReasons = [...Array(10).fill(null), 'call from customer'];
const statuses = [
  INDEPENDENT_WO_STATUS.inProgress,
  INDEPENDENT_WO_STATUS.inProgress,
  INDEPENDENT_WO_STATUS.inProgress,
  INDEPENDENT_WO_STATUS.inProgress,
  INDEPENDENT_WO_STATUS.inProgress,
  INDEPENDENT_WO_STATUS.inProgress,
  INDEPENDENT_WO_STATUS.scheduled,
  INDEPENDENT_WO_STATUS.scheduled,
  INDEPENDENT_WO_STATUS.completed,
  INDEPENDENT_WO_STATUS.completed,
  INDEPENDENT_WO_STATUS.canceled,
];
const host = process.env.FE_HOST;
const media = () => [
  {
    url: `${host}/media/${Math.floor(Math.random() * 100000)}.jpg`,
    timestamp: format(subHours(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    url: `${host}/media/${Math.floor(Math.random() * 100000)}.jpg`,
    timestamp: format(subHours(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
  },
];

// TODO: select trip charge billable line item from DB and put into fixtures when not empty
const lineItems = [
  {
    billableLineItemId: 1,
    globalRatesLineItemsId: 1,
    materialId: 1,
    price: 10,
    quantity: 1,
  },
];

// TODO: move this stub to test mocks when routePlanner service will be done
export const generateFakeItem = (ctx, { today, preferredRoute, independentWorkOrder }) => {
  const serviceDate = zonedTimeToUtc(independentWorkOrder.serviceDate, 'UTC');
  const startDate = startOfDay(serviceDate) <= startOfDay(today) ? today : null;
  ctx.logger.debug(`
        syncIndependentWosToDispatch->generateFakeItem->serviceDate:
        ${serviceDate.valueOf()}
    `);
  ctx.logger.debug(`syncIndependentWosToDispatch->generateFakeItem->today: ${today.valueOf()}`);
  const item = {
    ...independentWorkOrder,
    status: startDate ? randomArrayItem(statuses) : INDEPENDENT_WO_STATUS.scheduled,
  };
  switch (item.status) {
    case INDEPENDENT_WO_STATUS.inProgress:
      item.equipmentNumber = randomArrayItem(equipments);
      item.startedAt = startDate;
      item.assignedRoute = routes.includes(preferredRoute)
        ? preferredRoute
        : randomArrayItem(routes);
      item.driverName = randomArrayItem(drivers);
      item.truckNumber = randomArrayItem([...trucks, ...Array(100).fill(null)]);
      item.commentFromDriver = randomArrayItem(comments);
      item.media = [randomArrayItem([...media(), ...Array(100).fill(null)])].filter(Boolean);
      break;
    case INDEPENDENT_WO_STATUS.scheduled:
      item.assignedRoute = routes.includes(preferredRoute)
        ? preferredRoute
        : randomArrayItem(routes);
      break;
    case INDEPENDENT_WO_STATUS.canceled: {
      item.canceledAt = today;
      item.assignedRoute = routes.includes(preferredRoute)
        ? preferredRoute
        : randomArrayItem(routes);
      item.cancellationReason = randomArrayItem(cancellationReasons);
      const driverName = randomArrayItem([...drivers, ...Array(100).fill(null)]);
      if (driverName) {
        item.driverName = driverName;
        item.commentFromDriver = randomArrayItem(comments);
      }
      item.truckNumber = randomArrayItem([...trucks, ...Array(100).fill(null)]);
      item.media = [randomArrayItem([...media(), ...Array(100).fill(null)])].filter(Boolean);
      item.lineItems = [randomArrayItem([...lineItems, ...Array(100).fill(null)])].filter(Boolean);
      break;
    }
    case INDEPENDENT_WO_STATUS.completed:
      item.assignedRoute = routes.includes(preferredRoute)
        ? preferredRoute
        : randomArrayItem(routes);
      if (startDate) {
        item.completedAt = startDate;
        item.driverName = randomArrayItem(drivers);
        item.truckNumber = randomArrayItem([...trucks, ...Array(100).fill(null)]);
        item.newEquipmentNumber = randomArrayItem(['123', ...Array(100).fill(null)]);
        item.commentFromDriver = randomArrayItem(comments);
        item.media = [randomArrayItem([...media(), ...Array(100).fill(null)])].filter(Boolean);
      } else {
        item.status = INDEPENDENT_WO_STATUS.scheduled;
      }
      break;
    default:
      break;
  }
  return item;
};

// TODO: move this stub to test mocks when routePlanner service will be done
export const subscriber = async (ctx, { independentOrders, preferredRoute }) => {
  ctx.logger.debug(
    independentOrders,
    `
        syncIndependentWosToDispatch->subscriber->independentOrders
    `,
  );
  ctx.logger.debug(`syncIndependentWosToDispatch->subscriber->preferredRoute: ${preferredRoute}`);
  const today = startOfToday();

  const items = independentOrders.map(independentWorkOrder =>
    generateFakeItem(ctx, { today, preferredRoute, independentWorkOrder }),
  );
  ctx.logger.debug(items, `syncIndependentWosToDispatch->subscriber->items`);

  await syncFromDispatch(ctx, { independentOrders: items });
  ctx.logger.info(`Synced "${independentOrders.length}" WOs with Dispatch`);
};
