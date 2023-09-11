import assert from 'assert';
import { addDays } from 'date-fns';
import R, { compose as o } from 'ramda';
import workOrders from '../../../src/tables/workorders';
import constants from '../../../src/utils/constants';
import { expect, body } from '../../helpers/request';
import { my } from '../../../src/utils/query';
import mockWorkOrder, { statuses, actions } from '../../fixtures/workorder';
import mockLocation from '../../fixtures/location';
import { checkLength, mockDates, checkDates } from '../common';
import {
  clear,
  upAPI,
  toCreate,
  point,
  rightBbox,
  wrongBbox,
  isOdd,
  all,
  odds,
  evens,
} from '../../helpers/data';
import config from '../../../src/config';

const secretPass = config.get('session.secret');

const {
  location: {
    type: { LOCATION },
  },
  workOrder: {
    status: { UNASSIGNED, ASSIGNED },
    action,
  },
} = constants;

const nullOrder = {
  status: null,
  action: null,
  size: null,
};

const loc = bbox => ({
  ...mockLocation(LOCATION, false),
  location: point(bbox),
});

const genChecks = R.curry((mapF, genF) =>
  R.pipe(R.times(genF), R.map(R.concat([1])), R.append([0, '00']), R.map(mapF))(all),
);

const genListCheck = R.uncurryN(3, (query, n) =>
  R.pipe(
    genChecks(R.identity),
    R.take(n),
    R.reduce((acc, x) => [acc[0] + x[0], `${acc[1]},${x[1]}`], [0, '']),
    R.over(R.lensIndex(1), R.replace(/^,/, '')),
    ([length, filter]) => [{ [query]: filter }, length],
  ),
);

const genDriverNames = i => `Driver Name ${i}`;

const genSizes = o(R.multiply(10), R.add(1));

const genMaterials = i => `metrial-${i}`;

const call = (f, ...args) => (typeof f === 'function' ? f(...args) : f);

const oddsMock = (first, second) => async (api, i) => {
  const {
    body: { id },
  } = await api.createWorkorder().send({
    secretPass,
    ...call(first, i),
  });
  if (isOdd(i)) {
    await api.updateWorkorder({ workOrderId: id }).send(call(second, i));
  }
};

const simpleMock = (field, genF) => (api, i) =>
  api.createWorkorder().send({ secretPass, [field]: genF(i) });

const nearFuture = addDays(new Date(), 10);

let driver1;
let driver2;

const mockGens = {
  search: oddsMock(
    i =>
      mockWorkOrder({
        ...nullOrder,
        poNumber: `SEARCH-poNumber-${i}`,
        contactName: `SEARCH-contactName-${i}`,
        contactNumber: `SEARCH-contactNumber-${i}`,
        customerName: `SEARCH-customerName-${i}`,
        instructions: `SEARCH-instructions-${i}`,
        profileNumber: `SEARCH-profileNumber-${i}`,
      }),
    i => ({
      poNumber: `NEW-poNumber-${i}`,
    }),
  ),

  bounds: oddsMock(
    () => ({
      location1: loc(rightBbox),
      location2: loc(rightBbox),
    }),
    () => ({
      location1: loc(wrongBbox),
      location2: loc(wrongBbox),
    }),
  ),

  action: oddsMock({ action: actions.SPOT }, { action: actions.FINAL }),

  status: oddsMock({ status: statuses.COMPLETED }, { status: statuses.CANCELED }),

  date: mockDates(workOrders, 'scheduledDate'),

  modifiedSince: mockDates(workOrders, 'modifiedDate', nearFuture),

  driverId: async (api, instructions) => {
    if (!driver1 && !driver2) {
      driver1 = await body(api.createDriver().send({ name: 'Test Driver 1' }));
      driver2 = await body(api.createDriver().send({ name: 'Test Driver 2' }));
    }

    // create an unassigned order
    const workOrder = await body(
      api.createWorkorder().send({
        secretPass,
        status: UNASSIGNED,
        instructions,
      }),
    );

    // assign Test Driver 1
    await api.updateWorkorder({ workOrderId: workOrder.id }).send({
      status: ASSIGNED,
      driverId: driver1.id,
    });

    if (isOdd(instructions)) {
      // assign Test Driver 2
      await api.updateWorkorder({ workOrderId: workOrder.id }).send({
        status: ASSIGNED,
        driverId: driver2.id,
      });
    }
  },

  driverName: async (api, i) => {
    const { body: driver } = await api.createDriver().send({
      name: genDriverNames(i),
    });
    return await api.createWorkorder().send({ secretPass, driverId: driver.id });
  },

  size: simpleMock('size', genSizes),

  material: simpleMock('material', genMaterials),

  order: (api, i) =>
    api.createWorkorder().send({
      secretPass,
      status: statuses.ASSIGNED,
      ...(isOdd(i) ? { index: i } : {}),
    }),
};

const workOrdersToCreate = toCreate(mockGens);

const wos = R.reverse(R.times(R.identity, all));

const mapInstructions = R.map(R.prop('instructions'));

export const before = upAPI(mockGens, workOrdersToCreate);

export const after = clear;

export default {
  [`should work without any parameter passed`]: async request => {
    const { body: listOfWorkOrders } = await expect(200, request());
    assert(R.is(Array, listOfWorkOrders));
    assert.equal(listOfWorkOrders.length, workOrdersToCreate.length);
  },

  [`should search by poNumber`]: checkLength({ search: 'CH-poNumber' }, 0),

  [`should search by newPoNumer`]: checkLength({ search: 'EW-poNumber' }, 0),

  [`should search by contractName`]: checkLength({ search: 'CH-contactName' }, all),

  [`should search by contractNumber`]: checkLength({ search: 'actNumber' }, 0),

  [`should search by customerName`]: checkLength({ search: 'CH-customerNa' }, all),

  [`should search by instructions`]: checkLength({ search: 'CH-instr' }, all),

  [`should search by profileNumber`]: checkLength({ search: 'CH-profileNum' }, 0),

  [`should search by action`]: checkLength({ search: actions.SPOT }, evens),

  [`should search by id`]: checkLength({ search: workOrdersToCreate.length - 1 }, 1),

  ...R.fromPairs(
    genChecks(
      ([length, driverName]) => [
        `should search by driverName=${driverName}`,
        checkLength({ search: driverName }, length),
      ],
      genDriverNames,
    ),
  ),

  [`should search by right boundary box`]: checkLength({ bounds: R.join(',', rightBbox) }, evens),

  [`should search by wrong boundary box`]: checkLength({ bounds: R.join(',', wrongBbox) }, odds),

  [`should search by action SPOT`]: checkLength({ action: actions.SPOT }, evens),

  [`should search by action FINAL`]: checkLength({ action: actions.FINAL }, odds),

  [`should search by all actions`]: checkLength(
    {
      action: `${actions.SPOT},${actions.FINAL}`,
    },
    all,
  ),

  [`should search by status UNASSIGNED`]: checkLength({ status: statuses.COMPLETED }, evens),

  [`should search by status ASSIGNED`]: checkLength({ status: statuses.CANCELED }, odds),

  [`should search by all statuses`]: checkLength(
    {
      status: `${statuses.COMPLETED},${statuses.CANCELED}`,
    },
    all,
  ),

  [`should find all work orders modified four days ago`]: checkDates,

  [`test modifiedSince`]: checkLength({ modifiedSince: nearFuture.valueOf() }, all),

  'search by customer name with deleted wo': async (request, api) => {
    const { body: wo } = await api.createWorkorder().send({
      secretPass,
      customerName: `deleted wo`,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      location1: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    await api.deleteWorkorder({ workOrderId: wo.id }).query();

    const { body: wos } = await request().query({
      search: wo.customerName,
      size: 12,
      deleted: 1,
    });

    const deletedWO = wos[0];

    assert.equal(deletedWO.customerName, wo.customerName);
    assert.equal(deletedWO.size, wo.size);
    assert.equal(deletedWO.deleted, 1);
  },

  'search by customer name with deleted wo 0': async (request, api) => {
    const { body: wo } = await api.createWorkorder().send({
      secretPass,
      customerName: `deleted wo`,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      location1: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    await api.deleteWorkorder({ workOrderId: wo.id }).query();

    const { body: wos } = await request().query({
      search: wo.customerName,
      size: 12,
      deleted: 0,
    });

    assert.equal(wos.length, 0);
  },

  'API-157 - search by location1 waypoint name': async (request, api) => {
    const locName = 'Special location1 waypoint name';
    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      location1: {
        ...mockLocation(LOCATION, false, ''),
        waypointName: locName,
      },
    });

    const { body: wos } = await request().query({ search: locName });

    assert.equal(wos.length, 1);
  },
  'API-175 - WO should contain field textOnWay': async (request, api) => {
    const textOnWay = 'textOnWay';
    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      textOnWay,
      instructions: textOnWay,
      location1: mockLocation(LOCATION, false, ''),
    });

    const { body: wos } = await request().query({ search: textOnWay });

    assert.equal(wos.length, 1);
    assert.equal(wos[0].textOnWay, textOnWay);
  },
  'API-157 - search by location1 name': async (request, api) => {
    const locName = 'Special location1 name';
    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      location1: {
        ...mockLocation(LOCATION, false, ''),
        name: locName,
      },
    });

    const { body: wos } = await request().query({ search: locName });

    assert.equal(wos.length, 1);
  },

  'API-157 - search by location2 waypoint name': async (request, api) => {
    const locName = 'Special location2 waypoint name';

    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'DUMP AND RETURN',
      material: 'C & D',
      location1: {
        ...mockLocation(LOCATION, false, ''),
        waypointName: '3219',
      },
      location2: {
        ...mockLocation(LOCATION, false, ''),
        waypointName: locName,
      },
    });

    const { body: wos } = await request().query({ search: locName });

    assert.equal(wos.length, 1);
  },

  'API-157 - search by location2 name': async (request, api) => {
    const locName = 'Special location2 name';

    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'DUMP AND RETURN',
      material: 'C & D',
      location1: {
        ...mockLocation(LOCATION, false, ''),
        name: '3216',
      },
      location2: {
        ...mockLocation(LOCATION, false, ''),
        name: locName,
      },
    });

    const { body: wos } = await request().query({ search: locName });

    assert.equal(wos.length, 1);
  },
  'API-181 - search wo by action GENERAL PURPOSE': async (request, api) => {
    const { body: wo } = await api.createWorkorder().send({
      secretPass,
      customerName: `general wo`,
      status: UNASSIGNED,
      action: action.GENERAL_PURPOSE,
      location1: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    const { body: wos } = await request().query({
      action: action.GENERAL_PURPOSE,
    });

    const newWOs = wos.filter(el => el.id === wo.id);
    assert.equal(newWOs.length, 1);
    assert.equal(newWOs[0].action, wo.action);
  },
  'API-216 - WO should contain field permitNumber': async (request, api) => {
    const permitNumber = '222QQQWWW';
    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      permitNumber,
      instructions: permitNumber,
      location1: mockLocation(LOCATION, false, ''),
    });
    const { body: wos } = await request().query({ search: permitNumber });

    assert.equal(wos[0].permitNumber, permitNumber);
    assert.equal(wos[0].permittedCan, true);
  },
  'API-248 - search by permit number': async (request, api) => {
    const permitNumber = '222QQQWWW1';
    await api.createWorkorder().send({
      secretPass,
      size: 12,
      status: UNASSIGNED,
      action: 'SPOT',
      material: 'C & D',
      permitNumber: permitNumber,
      location1: mockLocation(LOCATION, false, ''),
    });
    const { body: wos } = await request().query({ search: permitNumber });

    assert.equal(wos.length, 1);
  },
  'API-181 - should search WO by action GENERAL PURPOSE, size and material': async (
    request,
    api,
  ) => {
    const abra = 'some uniq abracadabra valu';
    const { body: wo } = await api.createWorkorder().send({
      secretPass,
      customerName: abra,
      status: UNASSIGNED,
      action: action.GENERAL_PURPOSE,
      location1: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
    });

    const { body: wos } = await request().query({ search: abra });

    const newWOs = wos.filter(el => el.id === wo.id);
    assert.equal(newWOs.length, 1);
    assert.equal(newWOs[0].action, wo.action);

    const { body: wos2 } = await request().query({
      search: abra,
      action: action.GENERAL_PURPOSE,
      size: 40,
    });

    assert.equal(wos2.length, 1);
  },
  [`should fetch all the work orders which were assigned to the driver,
    no matter are they assigned to this driver right now.
    there should be all the orders which are associated with Test Driver 1`]: async request =>
    assert.deepEqual(
      mapInstructions(
        await body(
          expect(
            200,
            request().query({
              driverId: driver1.id,
              deepAssignmentSearch: true,
            }),
          ),
        ),
      ),
      wos,
    ),

  [`should fetch all the work orders which were assigned to the driver,
    including previously assigned work orders.
    only odd orders should be associated with Driver 2`]: async request =>
    assert.deepEqual(
      mapInstructions(
        await body(
          expect(
            200,
            request().query({
              driverId: driver2.id,
              deepAssignmentSearch: true,
            }),
          ),
        ),
      ),
      R.filter(isOdd, wos),
    ),

  [`should fetch only those work orders which are assigned to the driver
    right now`]: async request =>
    assert.deepEqual(
      mapInstructions(
        await body(
          expect(
            200,
            request().query({
              driverId: driver1.id,
            }),
          ),
        ),
      ),
      R.filter(R.complement(isOdd), wos),
    ),

  ...R.fromPairs(
    genChecks(([length, size]) => [`size=${size}`, checkLength({ size }, length)], genSizes),
  ),
  sizes: R.apply(checkLength, genListCheck('size', 3, genSizes)),

  ...R.fromPairs(
    genChecks(
      ([length, material]) => [`material=${material}`, checkLength({ material }, length)],
      genMaterials,
    ),
  ),
  materials: R.apply(checkLength, genListCheck('material', 2, genMaterials)),

  [`API-259 should filter by having scheduled start`]: async request => {
    const listWO = await my(workOrders.select());

    assert.equal(listWO.length, 66);

    const filtered = R.filter(wo => !R.isNil(wo.scheduledStart), listWO);
    const { body: woList } = await request().query({ scheduledStart: 1 }).expect(200);

    assert.equal(woList.length, 5);
    assert.equal(woList.length, filtered.length);
  },

  [`API-259 should filter by special parameters`]: async (request, api) => {
    const createWorkOrder = async params =>
      await api.createWorkorder().send({
        secretPass,
        status: UNASSIGNED,
        action: action.GENERAL_PURPOSE,
        location1: mockLocation(LOCATION, false, `SRCH-initial-loc-1-`),
        ...params,
      });

    const testQuantityWO = async (searchBy, expectNumber) => {
      const listWO = await my(workOrders.select());
      const checkWO = wo => {
        const queryKeys = R.keys(searchBy);

        return R.reduce((query, param) => query && wo[param], wo[queryKeys.pop()] === 1, queryKeys);
      };

      const filtered = R.filter(checkWO, listWO);
      const { body: woList } = await request().query(searchBy).expect(200);

      assert.equal(woList.length, expectNumber);
      assert.equal(woList.length, filtered.length);
    };

    // At this m oment there are random values of workorders with special params,
    // so we look up for the quantities of these workorders and add it to our expectations

    const alreadyExistWO = [];

    await my(async query => {
      alreadyExistWO.push(await query(workOrders.select().where({ priority: 1 })));
      alreadyExistWO.push(await query(workOrders.select().where({ sos: 1 })));
      alreadyExistWO.push(await query(workOrders.select().where({ priority: 1, sos: 1 })));
      alreadyExistWO.push(await query(workOrders.select().where({ cow: 1, sos: 1 })));
    });

    const { body: wo1 } = await createWorkOrder({ cow: 1, priority: 1 });
    const { body: wo2 } = await createWorkOrder({ cow: 1, sos: 1 });
    const { body: wo3 } = await createWorkOrder({ sos: 1 });

    await testQuantityWO({ priority: 1 }, 1 + alreadyExistWO[0].length);
    await testQuantityWO({ sos: 1 }, 2 + alreadyExistWO[1].length);
    await testQuantityWO({ priority: 1, sos: 1 }, 0 + alreadyExistWO[2].length);
    await testQuantityWO({ cow: 1, sos: 1 }, 1 + alreadyExistWO[3].length);

    await my(workOrders.delete().where(workOrders.id.in([wo1.id, wo2.id, wo3.id])));
  },
};
