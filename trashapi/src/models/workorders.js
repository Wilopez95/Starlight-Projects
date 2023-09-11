import R from 'ramda';
import HttpStatus from 'http-status';
import AWS from 'aws-sdk';

import {
  workOrdersLocationsJoin,
  workOrdersLocationsFields,
} from '../tables/workorders-locations.js';
import workOrdersLocationsNotes, {
  workOrdersLocationsNotesJoin,
} from '../tables/workorders-locations-notes.js';
import workOrders from '../tables/workorders.js';
import workOrderNotes from '../tables/wo-notes.js';
import locations1 from '../tables/locations1.js';
import locations2 from '../tables/locations2.js';
import { err } from '../utils/errors.js';
import { validate, buildReadableError } from '../utils/validators.js';
import { ValidationError, APIError } from '../services/error/index.js';
import logger from '../services/logger/index.js';
import { getBillableServices, getMaterials } from '../services/hauling/sync.js';
import {
  AWS_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_SNS_IOS,
  AWS_SNS_ANDROID,
} from '../config.js';
import { unixTime, dateFrmt, dateRange, list, datesWithOutTimeRange } from '../utils/format.js';
import { l, json, my } from '../utils/query.js';
import {
  needsPushNotification,
  getPushNotificationMessageEnglish,
  getPushNotificationMessageSpanish,
} from '../utils/notificationHelpers.js';
import constants from '../utils/constants.js';
import { foldP, validateInteger } from '../utils/functions.js';
import { getHaulingDriverById, getHaulingDrivers } from '../services/hauling/drivers.js';
import ACTIONS from '../consts/actions.js';
import { checkCoreHeaderValue } from '../utils/helpers.js';
import Materials from './materials.js';
import Sizes from './sizes.js';
import universal from './universal.js';
import { setState } from './wo-notes.js';
import { getSizes as constGetSizes, getMaterials as constGetMaterials } from './constants.js';
import { setLocationId, contains } from './locations.js';

const { driver: driverActions, dispatcher: dispatcherActions } = ACTIONS;
const {
  workOrder: {
    action,
    status: { COMPLETED, CANCELED, UNASSIGNED, ASSIGNED },
    note: {
      transitionState: { REASSIGNMENT },
    },
  },
} = constants;
const endStatuses = [COMPLETED, CANCELED];

const {
  RELOCATE,
  REPOSITION,
  DUMP_AND_RETURN_SUSPEND,
  FINAL_SUSPEND,
  SWITCH_SUSPEND,
  LIVE_LOAD_SUSPEND,
  FINAL_RESUME,
  LIVE_LOAD_RESUME,
  DUMP_AND_RETURN_RESUME,
  SWITCH_RESUME,
  FINAL,
  LIVE_LOAD,
  SWITCH,
  DUMP_AND_RETURN,
} = action;

const TRUE = workOrders.literal('TRUE');
const FALSE = workOrders.literal('FALSE');

const twoLocationsActions = [RELOCATE, REPOSITION];

const SUSPEND_ACTIONS = [DUMP_AND_RETURN_SUSPEND, FINAL_SUSPEND, SWITCH_SUSPEND, LIVE_LOAD_SUSPEND];
const RESUME_ACTIONS = [FINAL_RESUME, SWITCH_RESUME, LIVE_LOAD_RESUME, DUMP_AND_RETURN_RESUME];

const SUSPEND_RESUME_ACTIONS = [...SUSPEND_ACTIONS, ...RESUME_ACTIONS];

const ACTIONS_WITH_SUSPEND = [FINAL, LIVE_LOAD, SWITCH, DUMP_AND_RETURN];

/**
 * It checks if the driver has permission to access the work order.
 * @param workOrder - the work order object
 * @param user - the user object from the database
 * @returns A function that takes in a workOrder and a user and returns an error.
 */
export const checkDriverAccess = (workOrder, user) => {
  const { driver, status } = workOrder;
  const { email: userEmail, permissions } = user;
  let error = null;

  const isDriverRole = permissions?.includes(driverActions.access);
  const isDispatcherRole = permissions?.includes(dispatcherActions.access);
  if (!isDriverRole || (isDriverRole && isDispatcherRole)) {
    return error;
  }

  const isAssigned = driver?.email === userEmail;
  const isEndStatus = endStatuses.includes(status);

  if (!isAssigned) {
    error = 'You are not assigned to this Work Order';
  }
  if (isAssigned && isEndStatus) {
    error = `The Work Order was ${status}`;
  }
  return error;
};

const dispatchOrderItems = [
  {
    name: 'material',
    model: Materials,
    field: 'name',
  },
  {
    name: 'size',
    model: Sizes,
    field: 'name',
  },
];
const saveHaulingData = async (workOrderSeed, validationData, user) => {
  try {
    await my(async query => {
      const { isFromHauling } = validationData;
      if (!isFromHauling) {
        return;
      }

      await Promise.all(
        dispatchOrderItems.map(async orderItem => {
          const { name, model, field } = orderItem;
          const value = workOrderSeed[name];
          if (!value) {
            return;
          }

          const item = { [field]: value };
          const records = await model.findAll(item, query);
          if (!records || !records.length) {
            await model.create(item, user, query);
          }
        }),
      );
    }, user);
  } catch (error) {
    logger.error(error);
  }
};

const getValidationData = async ({ req, workOrder, query }) => {
  const { id, businessLineId: lineId, tenantId, isFromCoreHeader } = workOrder;
  if (!id && isFromCoreHeader) {
    return { isFromHauling: true };
  }
  const isCreatingFromHauling = validateInteger(lineId) && parseInt(lineId, 10) > 0;
  const isCreatedFromHauling = !!id && parseInt(tenantId, 10) > 0;
  const isFromHauling = isCreatingFromHauling || isCreatedFromHauling;

  if (!isFromHauling) {
    const [sizes, materials] = await Promise.all([constGetSizes(query), constGetMaterials(query)]);
    return {
      sizes,
      materials,
      isFromHauling,
    };
  }

  const orderBody = {
    id: isCreatedFromHauling ? id : 0,
    tenantId: tenantId || -1,
  };
  const queryBody = {
    businessLineId: lineId,
  };
  const [servicesData, materialsData] = await Promise.all([
    getBillableServices({
      req,
      workOrder: orderBody,
      query: queryBody,
    }),
    getMaterials({
      req,
      workOrder: orderBody,
      query: queryBody,
    }),
  ]);

  const sizes = R.map(service => service.equipmentItem.shortDescription.toString(), servicesData);
  const materials = R.map(material => material.description, materialsData);
  return {
    sizes,
    materials,
    isFromHauling,
  };
};

const validateOnCreate = async (workOrder, data) => {
  const actions = R.values(action);
  const { sizes, materials } = data;
  const { isFromCoreHeader } = workOrder;

  const sizeRules = ['notEmpty'];
  const materialRules = ['notEmpty'];

  if (!isFromCoreHeader) {
    sizeRules.push({
      name: 'inArray',
      options: sizes,
    });
    materialRules.push({
      name: 'inArray',
      options: materials,
    });
  }

  const validators = [
    {
      param: 'size',
      rules: sizeRules,
    },
    {
      param: 'material',
      rules: materialRules,
    },
    {
      param: 'scheduledDate',
      rules: ['notEmpty'],
    },
    {
      param: 'action',
      rules: [
        'notEmpty',
        {
          name: 'inArray',
          options: actions,
        },
      ],
    },
  ];
  let ruleForLocation2 = {};
  if (R.contains(workOrder.action, twoLocationsActions)) {
    ruleForLocation2 = {
      param: 'location2',
      rules: ['notEmpty', 'isObject'],
    };
    validators.push(ruleForLocation2);
  }

  const errors = validate(validators, workOrder);
  if (errors.length > 0) {
    const [{ msg, param, value, elem }] = errors;
    const errorMsg = buildReadableError(msg, param, value, elem);
    throw err(errorMsg, 400);
  }
};

const validateOnUpdate = async (workOrder, workOrderSeed, data) => {
  const actions = R.values(action);
  const { sizes, materials } = data;

  const sizeRules = [
    'notEmpty',
    {
      name: 'inArray',
      options: sizes,
    },
  ];

  const materialRules = [
    'notEmpty',
    {
      name: 'inArray',
      options: materials,
    },
  ];

  const validators = [
    {
      param: 'size',
      rules: sizeRules,
      optional: true,
    },
    {
      param: 'material',
      rules: materialRules,
      optional: true,
    },
    {
      param: 'location1',
      rules: ['notEmpty', 'isObject'],
      optional: true,
    },
    {
      param: 'scheduledDate',
      rules: ['notEmpty'],
      optional: true,
    },
    {
      param: 'action',
      rules: [
        'notEmpty',
        {
          name: 'inArray',
          options: actions,
        },
      ],
      optional: true,
    },
  ];
  let ruleForLocation2 = {};
  if (R.contains(workOrder.action, twoLocationsActions)) {
    ruleForLocation2 = {
      param: 'location2',
      rules: ['notEmpty', 'isObject'],
      optional: true,
    };
    validators.push(ruleForLocation2);
  }

  const errors = validate(validators, workOrderSeed);
  if (errors.length > 0) {
    const [{ msg, param, value, elem }] = errors;
    const errorMsg = buildReadableError(msg, param, value, elem);
    throw new ValidationError(errorMsg, HttpStatus.BAD_REQUEST);
  }
};

const woFrom = ({ driverId, deepAssignmentSearch }) =>
  driverId && deepAssignmentSearch ? workOrdersLocationsNotesJoin : workOrdersLocationsJoin;

const byId = ({ id }) => (id ? workOrders.id.equals(id) : TRUE);

const byBusinessUnitId = ({ businessUnitId }) =>
  businessUnitId ? workOrders.haulingBusinessUnitId.equals(businessUnitId) : TRUE;

const bySuspended = ({ suspended }) =>
  suspended === '1' ? workOrders.suspensionLocationId.isNotNull() : TRUE;

const bySearch = async req => {
  const {
    query: { search },
  } = req;
  if (!search) {
    return TRUE;
  }

  const query = workOrders.contactName
    .ilike(l(search))
    .or(workOrders.customerName.ilike(l(search)))
    .or(workOrders.instructions.ilike(l(search)))
    .or(locations1.waypointName.ilike(l(search)))
    .or(locations1.name.ilike(l(search)))
    .or(locations2.waypointName.ilike(l(search)))
    .or(locations2.name.ilike(l(search)))
    .or(workOrders.action.ilike(l(search)))
    .or(workOrders.id.cast('text').ilike(l(search)))
    .or(workOrders.permitNumber.ilike(l(search)));

  const drivers = await getHaulingDrivers(req, { query: search });
  const driverIds = drivers?.map(({ id }) => id);
  if (driverIds?.length) {
    query.or(workOrders.driverId.in(driverIds));
  }

  return query;
};

const byBounds = ({ bounds }) =>
  bounds ? contains(locations1, bounds).or(contains(locations2, bounds)) : TRUE;

const byDateRange = ({ date }) => {
  // if the dateRange set by timestamps, else if it set by dates
  // TODO: remove first condition after transition period.
  if (R.test(dateRange.format, date)) {
    return dateRange((start, end) => workOrders.scheduledDate.between(start, end), date);
  }
  if (R.test(dateRange.dateFormat, date)) {
    return datesWithOutTimeRange(
      (start, end) => workOrders.scheduledDate.between(start, end),
      date,
    );
  }
  return TRUE;
};

const byModifiedSince = ({ modifiedSince }) =>
  modifiedSince ? workOrders.modifiedDate.gt(unixTime(modifiedSince)) : TRUE;

const byDriverId = ({ driverId, deepAssignmentSearch }) =>
  driverId
    ? workOrders.driverId
        .equals(Number(driverId))
        .or(
          deepAssignmentSearch
            ? json(workOrderNotes.note, 'driverId').equals(Number(driverId))
            : FALSE,
        )
    : TRUE;

const bySize = ({ size }) => (size ? workOrders.size.in(list(size)) : TRUE);

const byMaterial = ({ material }) => (material ? workOrders.material.in(list(material)) : TRUE);

const byAction = ({ action }) => (action ? workOrders.action.in(list(action)) : TRUE);

const byStatus = ({ status }) => (status ? workOrders.status.in(list(status)) : TRUE);

const byDeleted = ({ deleted }) => (deleted === '1' ? TRUE : workOrders.deleted.notEqual('TRUE'));

const bySpecialParams = httpQuery => {
  const params = [
    'sos',
    'cow',
    'alleyPlacement',
    'permittedCan',
    'earlyPickUp',
    'cabOver',
    'okToRoll',
    'priority',
    'negotiatedFill',
    'customerProvidedProfile',
  ];

  const qp = R.pick(params, httpQuery);
  const queryKeys = R.filter(param => qp[param] === '1', R.keys(qp));

  if (R.isEmpty(queryKeys)) {
    return TRUE;
  }
  return R.reduce(
    (query, param) => query.and(workOrders[param].equal('TRUE')),
    workOrders[queryKeys.pop()].equal('TRUE'),
    queryKeys,
  );
};

const byHavingScheduledStart = ({ scheduledStart }) =>
  scheduledStart === '1' ? workOrders.scheduledStart.isNotNull() : TRUE;

const group = (woData, { driverId, deepAssignmentSearch }) =>
  driverId && deepAssignmentSearch ? woData.group(workOrders.id) : woData;

// $FlowIssue
export const findAll = R.curry(async (req, query) => {
  const { query: httpQuery } = req;
  const woQuery = workOrders
    .select(workOrdersLocationsFields)
    .from(woFrom(httpQuery))
    .where(byId(httpQuery))
    .where(byBounds(httpQuery))
    .where(byDateRange(httpQuery))
    .where(byModifiedSince(httpQuery))
    .where(byDriverId(httpQuery))
    .where(bySize(httpQuery))
    .where(byMaterial(httpQuery))
    .where(byAction(httpQuery))
    .where(byStatus(httpQuery))
    .where(bySpecialParams(httpQuery))
    .where(byHavingScheduledStart(httpQuery))
    .where(bySuspended(httpQuery))
    .where(byDeleted(httpQuery))
    .where(byBusinessUnitId(httpQuery));

  const search = await bySearch(req);
  woQuery.where(search);

  return query(
    group(woQuery, httpQuery).order(workOrders.scheduledDate.desc, workOrders.index.desc),
  );
});

// $FlowIssue
export const findByDriverId = R.curry((driverId, query) =>
  query(
    workOrdersLocationsNotes
      .select()
      .where(json(workOrderNotes.note, 'driverId').equals(Number(driverId)))
      .group(workOrders.id),
  ),
);

export const findById = universal.findById(
  R.curry((httpQuery, query) =>
    query(
      workOrders
        .select(workOrdersLocationsFields)
        .from(woFrom({}))
        .where(byId(httpQuery))
        .where(byDeleted(httpQuery)),
    ),
  ),
);

export const findFullById = R.curry(async (params, query) => {
  const { id, req } = params;
  const [workOrder] = await query(
    workOrders.select(workOrdersLocationsFields).from(woFrom({})).where(byId({ id })),
  );
  if (!workOrder) {
    return workOrder;
  }
  const driver = await getHaulingDriverById(req, workOrder.driverId);
  workOrder.driver = driver ?? { truck: {} };
  return workOrder;
});

const singular = universal.singular(workOrders, findById);

const setLocationIds = (workOrder, user, query) =>
  foldP(
    async (queue, i) =>
      R.append(
        await setLocationId(
          {
            location: workOrder[`location${i}`],
            suffix: i,
          },
          user,
          query,
        ),
        queue,
      ),

    [],
    R.times(R.add(1), 2),
  );

const formatDate = R.map(
  date => R.unless(R.propSatisfies(R.isNil, date), R.over(R.lensProp(date), dateFrmt)),
  ['scheduledDate'],
);

const assignedMessage = name => `Assigned to ${name}`;

const reassignedMessage = (fromName, toName) => `Reassigned from ${fromName} to ${toName}`;

const unassignedMessage = name => `Unassigned from ${name}`;

// $FlowIssue
export const create = R.curry(async (workOrder, user, query, req) => {
  workOrder.isFromCoreHeader = checkCoreHeaderValue(req);
  if (workOrder.permitNumber) {
    workOrder.permitNumber = workOrder.permitNumber.trim();
  }
  if (workOrder.permitNumber) {
    workOrder.permittedCan = true;
  }
  if (R.contains(workOrder.action, SUSPEND_RESUME_ACTIONS)) {
    throw new ValidationError(
      'You cannot create a SUSPEND or RESUME work order.',
      HttpStatus.BAD_REQUEST,
    );
  }
  workOrder.haulingSync = !!workOrder.tenantId;
  workOrder.haulingBusinessUnitId = workOrder.haulingBusinessUnitId ?? workOrder.businessUnitId;
  const validationData = await getValidationData({ req, workOrder, query });
  try {
    await validateOnCreate(workOrder, validationData);
  } catch (error) {
    throw err(error, 400);
  }

  const prepare = R.compose(
    R.omit(['businessLineId', 'businessUnitId', 'isFromCoreHeader']),
    ...formatDate,
    ...(await setLocationIds(workOrder, user, query)),
  );
  const created = await singular.create(prepare(workOrder), user, query);
  created.driver = (await getHaulingDriverById(req, created.driverId)) ?? {};
  // only for structured manifest (guma) will create a "tracking doc"
  // REMOVED see with-structured-manifest branch

  // if new work order status is assigned and there is a driver id (which there always should be)
  // create a work order note for reassignment
  if (created.status === ASSIGNED && created.driverId) {
    await setState(
      created.id,
      REASSIGNMENT,
      {
        driverId: created.driverId,
        text: assignedMessage(created.driver.description),
      },
      null,
      user,
      query,
    );
    // if structured manifest is enabled and we have a trackingDocId from the new work order
    // update the tracking doc with the driver info since the work order was assigned above
    // REMOVED see with-structured-manifest branch
  }
  // These actions do not ever have a location 2
  // const WO_ACTIONS_NO_LOC2 = [GENERAL_PURPOSE, RELOCATE, REPOSITION];
  // if structured manifest enabled company, and the location2 is a waypoint,
  // auto populate the tracking doc receiving facility info.
  // REMOVED see with-structured-manifest branch
  saveHaulingData(workOrder, validationData, user);
  return created;
});

const sendNotification = (newDriver, oldDriver, message) => {
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });

  const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
  const deviceToken = oldDriver?.deviceToken;
  if (deviceToken) {
    sns.createPlatformEndpoint(
      {
        PlatformApplicationArn: deviceToken.length < 100 ? AWS_SNS_IOS : AWS_SNS_ANDROID,
        Token: deviceToken,
      },
      (error, data) => {
        if (error) {
          logger.error(error.stack);
          return;
        }

        const endpointArn = data.EndpointArn;

        let payload = {
          default: message,
          APNS: {
            aps: {
              alert: message,
              sound: 'default',
              badge: 1,
            },
          },
          GCM: {
            notification: {
              title: '',
              body: message,
            },
          },
        };

        // first have to stringify the inner APNS object...
        payload.APNS = JSON.stringify(payload.APNS);
        payload.GCM = JSON.stringify(payload.GCM);
        // then have to stringify the entire message payload
        payload = JSON.stringify(payload);

        sns.publish(
          {
            Message: payload,
            MessageStructure: 'json',
            TargetArn: endpointArn,
          },
          err => {
            if (err) {
              logger.error(err.stack);
            }
          },
        );
      },
    );
  }
};

// the workOrderSeed is the data coming from the request
// down below, the workOrder is the item from the database we are updating

// eslint-disable-next-line complexity
export const update = R.curry(async (id, workOrderSeed, user, query, req) => {
  workOrderSeed.isFromCoreHeader = checkCoreHeaderValue(req);
  const workOrder = await findFullById({ id, req }, query);

  const driverError = checkDriverAccess(workOrder, user);
  if (driverError) {
    throw new APIError(driverError, HttpStatus.FORBIDDEN);
  }

  // if existing workOrder action is FINAL, SWITCH, LL, D&R and the
  // update is changing the action to FINAL SUSPEND, SWITCH SUSPEND, LL SUSPEND
  // or D&R SUSPEND and the step isnt FINISH SERVICE, dont allow it.
  if (
    R.contains(workOrder.action, ACTIONS_WITH_SUSPEND) &&
    R.contains(workOrderSeed.action, SUSPEND_ACTIONS) &&
    workOrder.step !== 'FINISH SERVICE'
  ) {
    throw new ValidationError(
      'Work order state must be reset to FINISH SERVICE before suspending.',
      HttpStatus.BAD_REQUEST,
    );
  }
  if (
    R.contains(workOrder.action, SUSPEND_ACTIONS) &&
    workOrderSeed.driverId !== workOrder.driverId &&
    workOrderSeed.status === 'UNASSIGNED' &&
    !R.contains(workOrderSeed.action, RESUME_ACTIONS)
  ) {
    throw new ValidationError(
      'The suspended order must be finished by the original driver',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Do not let driver proceed until app has updated to suspended flow
  if (
    !!workOrder.suspensionLocationId &&
    workOrder.suspensionLocationId !== null &&
    !!req.query &&
    !!req.query.isSuspendableAction
  ) {
    throw new ValidationError(
      'This order has been suspended and cannot currently be updated.',
      HttpStatus.BAD_REQUEST,
    );
  }

  if (endStatuses.includes(workOrderSeed.status) && workOrder.haulingSync) {
    workOrderSeed.haulingSync = false;
  }

  const prepare = R.compose(
    R.omit(['id', 'createdDate', 'modifiedDate', 'businessUnitId', 'isFromCoreHeader']),
    ...formatDate,
    ...(await setLocationIds(workOrderSeed, user, query)),
  );

  if (workOrderSeed.permitNumber) {
    workOrderSeed.permitNumber = workOrderSeed.permitNumber.trim();
  }

  if (
    workOrderSeed.permitNumber ||
    (workOrderSeed.permitNumber === undefined && workOrder.permitNumber)
  ) {
    workOrderSeed.permittedCan = true;
  }

  const newDriver = (await getHaulingDriverById(req, workOrderSeed.driverId)) ?? { truck: {} };
  const oldDriver = workOrder.driver;

  if (workOrderSeed.haulingBusinessUnitId || workOrderSeed.businessUnitId) {
    workOrderSeed.haulingBusinessUnitId =
      workOrderSeed.haulingBusinessUnitId ?? workOrderSeed.businessUnitId;
  }

  const validationData = await getValidationData({ req, workOrder, query });
  await validateOnUpdate(workOrder, workOrderSeed, validationData);

  // send driver push notification upon suspending their order
  if (
    R.contains(workOrder.action, ACTIONS_WITH_SUSPEND) &&
    R.contains(workOrderSeed.action, SUSPEND_ACTIONS)
  ) {
    const notifLanguage = oldDriver.language;
    const isEnglish = notifLanguage === 'en';
    const message = isEnglish
      ? `Order #${workOrder.id} has been suspended`
      : `La orden de trabajo #${workOrder.id} ha sido suspendida`;

    sendNotification(newDriver, oldDriver, message);
  }

  if (needsPushNotification(workOrder, workOrderSeed) && !!oldDriver?.deviceToken) {
    const notifLanguage = oldDriver.language;
    const isEnglish = notifLanguage === 'en';
    const message = isEnglish
      ? getPushNotificationMessageEnglish(workOrder, workOrderSeed)
      : getPushNotificationMessageSpanish(workOrder, workOrderSeed);

    sendNotification(newDriver, oldDriver, message);
  }

  if (
    workOrder.driverId !== workOrderSeed.driverId &&
    (workOrderSeed.status === ASSIGNED || workOrderSeed.status === UNASSIGNED)
  ) {
    let text = '';
    if (workOrder.status === UNASSIGNED) {
      text = assignedMessage(newDriver.description);
    } else if (workOrder.status === ASSIGNED && workOrderSeed.status === ASSIGNED) {
      text = reassignedMessage(oldDriver.description, newDriver.description);
    } else {
      text = unassignedMessage(oldDriver.description);
    }

    await setState(
      id,
      REASSIGNMENT,
      {
        ...(workOrderSeed.driverId ? { driverId: workOrderSeed.driverId } : {}),
        text,
      },
      null,
      user,
      query,
    );
  }

  // workflow for structured manifest
  // must have a trackingDocId value
  // REMOVED see with-structured-manifest branch

  const data = await singular.update(id, prepare(workOrderSeed), user, query);
  if (!workOrderSeed.isFromCoreHeader) {
    data.driver = (await getHaulingDriverById(req, data.driverId)) ?? {};
  }
  saveHaulingData(workOrderSeed, validationData, user);
  return data;
});

// $FlowIssue
export const bulk = R.curry(async (req, query) =>
  foldP(
    async (result, workOrderSeed) =>
      R.concat(
        result,
        workOrderSeed.id
          ? await update(workOrderSeed.id, workOrderSeed, req.user, query, req)
          : await create(workOrderSeed, req.user, query, req),
      ),
    [],
    req.body,
  ),
);

export const { remove } = singular;

export default {
  findAll,
  findByDriverId,
  findById,
  create,
  update,
  bulk,
  remove,
  checkDriverAccess,
  findFullById,
};
