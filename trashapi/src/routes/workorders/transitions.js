import R from 'ramda';
import { Router } from 'express';
import _debug from 'debug';

import { my } from '../../utils/query.js';
import workOrderNoteView from '../../views/wo-note.js';
import workOrderView from '../../views/workorder.js';
import { getState, setState } from '../../models/wo-notes.js';
import {
  findFullById,
  findById,
  checkDriverAccess,
  update as woUpdate,
} from '../../models/workorders.js';
import { getLocation } from '../../models/locations.js';
import Cans, { findAll, update as cansUpdate } from '../../models/cans.js';
import logger from '../../services/logger/index.js';
import { invalidInput, notFound, forbidden } from '../../utils/errors.js';
import constants from '../../utils/constants.js';
import asyncWrap from '../../utils/asyncWrap.js';
import { getCompany } from '../../models/companies.js';
import universal from '../universal.js';
import { sendSMS } from '../../utils/twilio.js';
import { getTravelTime } from '../../utils/google-map-directions.js';
import { syncOrderWithHauling } from '../../services/hauling/sync.js';
import { authorizedMiddleware as authorized } from '../../auth/authorized.js';
import ACTIONS from '../../consts/actions.js';

const { dispatcher, driver } = ACTIONS;

const debug = _debug('api:routes:transitions');

export const buildSMSMessage = (
  phoneNumber,
  user,
  size,
  action,
  material,
  locName,
  timeMessage,
) => {
  const actionWord = action === 'SPOT' ? 'DELIVERY' : action;
  return `*** DO NOT REPLY ***\nHello.\nWe are in route to perform a ${size} YD ${actionWord} of ${material} at ${locName}.${timeMessage}\nQuestions? Please call ${phoneNumber}\n${user.companyName}`;
};

export const buildSMSMessageGP = (user, locName, timeMessage, phoneNumber) =>
  `*** DO NOT REPLY ***\nHello.\nWe are in route to ${locName}.${timeMessage}\nQuestions? Please call ${phoneNumber}\n${user.companyName}`;

export const buildSMSMessageWithoutCan = (user, action, locName, timeMessage, phoneNumber) => {
  const actionWord = action === 'SPOT' ? 'DELIVERY' : action;
  return `*** DO NOT REPLY ***\nHello.\nWe are in route to perform a ${actionWord} at ${locName}.${timeMessage}\nQuestions? Please call ${phoneNumber}\n${user.companyName}`;
};

export const buildTimeMessage = time => ` Estimated time to job site is ${time}.`;

const router = new Router();

const {
  can: {
    action: { PICKUP, DROPOFF },
  },
  workOrder: {
    action: {
      RELOCATE,
      REPOSITION,
      DUMP_AND_RETURN_SUSPEND,
      DUMP_AND_RETURN_RESUME,
      DUMP_AND_RETURN,
      FINAL_RESUME,
      FINAL_SUSPEND,
      FINAL,
      LIVE_LOAD,
      LIVE_LOAD_RESUME,
      LIVE_LOAD_SUSPEND,
      SWITCH,
      SWITCH_RESUME,
      SWITCH_SUSPEND,
    },
    note: {
      transitionState: {
        WORK_ORDER_COMPLETE,
        PICKUP_CAN,
        DROP_CAN,
        START_WORK_ORDER,
        SUSPEND_WORK_ORDER,
      },
    },
  },
} = constants;

const NEEDS_RESUME = [DUMP_AND_RETURN_SUSPEND, FINAL_SUSPEND, SWITCH_SUSPEND, LIVE_LOAD_SUSPEND];
const NEEDS_ORIGINAL = [DUMP_AND_RETURN_RESUME, FINAL_RESUME, SWITCH_RESUME, LIVE_LOAD_RESUME];

function setResumeAction(action) {
  switch (action) {
    case 'FINAL SUSPEND':
      return FINAL_RESUME;

    case 'DUMP & RETURN SUSPEND':
      return DUMP_AND_RETURN_RESUME;

    case 'SWITCH SUSPEND':
      return SWITCH_RESUME;

    case 'LIVE LOAD SUSPEND':
      return LIVE_LOAD_RESUME;
    default:
      return action;
  }
}
function setOriginalAction(action) {
  switch (action) {
    case 'FINAL RESUME':
      return FINAL;

    case 'DUMP & RETURN RESUME':
      return DUMP_AND_RETURN;

    case 'SWITCH RESUME':
      return SWITCH;

    case 'LIVE LOAD RESUME':
      return LIVE_LOAD;
    default:
      return action;
  }
}

const validateLocation = asyncWrap(async (req, res, next) => {
  const { user, body: location } = req;
  req.location = await my(getLocation(location, user), user);
  next();
});

const sendSMSOnWorkOrderStart = async ({ req, newState, workOrderId, user }) => {
  debug('newState', newState);
  const coData = await getCompany(user.tenantId);
  const phoneNumber = coData?.phone;
  try {
    if (newState === START_WORK_ORDER) {
      const woPlain = await my(findFullById({ id: workOrderId, req }), user);
      const {
        textOnWay,
        driver: { truck = {} } = {},
        material,
        size,
        location1: { location, name },
        action,
      } = workOrderView(woPlain);
      if (textOnWay) {
        let timeMessage = '';
        const time = await getTravelTime(truck.location, location, textOnWay);
        if (time) {
          timeMessage = buildTimeMessage(time);
        }
        let message;
        if (size && material) {
          message = buildSMSMessage(user, size, action, material, name, timeMessage);
        } else if (action === 'GENERAL PURPOSE') {
          message = buildSMSMessageGP(user, name, timeMessage, phoneNumber);
        } else {
          message = buildSMSMessageWithoutCan(user, action, name, timeMessage, phoneNumber);
        }
        await sendSMS(textOnWay, message);
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

const triggerInventory = asyncWrap(async (req, res, next) => {
  const {
    user,
    params: { newState },
    workOrder: wo,
    query: { canId, prevLocationId, isSuspend },
  } = req;

  const workOrder = await my(findFullById({ id: wo.id, req }), user);

  if (!workOrder || R.isEmpty(workOrder)) {
    return next(notFound(`WorkOrder with id ${wo.id} does not exist`));
  }

  const driverError = checkDriverAccess(workOrder, user);
  if (driverError) {
    return next(forbidden(driverError));
  }

  if (newState !== PICKUP_CAN && newState !== DROP_CAN) {
    return next();
  }
  // eslint-disable-next-line complexity
  return await my(async query => {
    const {
      action,
      location1,
      location2,
      suspensionLocation,
      suspendedCanId,
      driver: { truck = {} } = {},
    } = workOrderView(workOrder);

    debug('workOrderView(workOrder)', workOrderView(workOrder));

    if (newState === PICKUP_CAN && !canId) {
      return next(invalidInput(`There is no canId in the query`));
    }

    if (newState === DROP_CAN && !canId && !truck.id) {
      return next(invalidInput(`There is neither canId in the query nor truck in the work order`));
    }
    debug('new state', newState);
    // picking up a suspended can
    // if the order is resuming a suspend, the can being picked up
    // must be the can from the original suspension
    if (newState === PICKUP_CAN && isSuspend === 'true' && +canId !== +suspendedCanId) {
      return next(
        invalidInput(
          `The can with id ${canId} does not match the suspended can id ${suspendedCanId} from the work order.`,
        ),
      );
    }

    const [can] = await findAll(canId ? { id: canId } : { truckId: truck.id }, query);
    if (!can) {
      return next(notFound(`Can with id ${canId} does not exist`));
    }
    // if the order is not a suspend/resume flow and the can is marked inUse
    // it means the can is suspended and we should not allow the user to pick
    // this can up.
    if (newState === PICKUP_CAN && can.inUse === 1 && isSuspend !== 'true') {
      return next(
        invalidInput(`Can with the id ${canId} is in use. Please pick up a different can.`),
      );
    }
    // establishes the relationship between the suspended can and the wo.
    // marks can as inUse when it is dropped
    if (newState === DROP_CAN && isSuspend === 'true' && canId) {
      await woUpdate(wo.id, { suspendedCanId: +canId }, user, query, req);
      await cansUpdate(parseInt(canId, 10), { inUse: 1 }, user, query, req);
    }
    //  marks can as not inUse when an order in the resume flow picks it up
    if (newState === PICKUP_CAN && isSuspend === 'true' && canId) {
      // @TODO: Do we want to disassociate the can from the work order once it is no longer suspended?
      // await WorkOrders.update(wo.id, { suspendedCanId: null }, user, query);
      await cansUpdate(canId, { inUse: 0 }, user, query, req);
    }

    if (can.locationId !== null) {
      if (
        can.locationId !== location1.id &&
        can.locationId !== location2.id &&
        can.locationId !== suspensionLocation.id &&
        can.truckId !== truck.id
      ) {
        return next(
          invalidInput(`
          Can exists neither in work order location nor in driver's truck
        `),
        );
      }
    }

    let dropCanLocation;
    if (prevLocationId !== undefined) {
      dropCanLocation = { id: prevLocationId };
    } else if (action === RELOCATE || action === REPOSITION) {
      dropCanLocation = location2;
    } else if (
      action === FINAL_SUSPEND ||
      action === DUMP_AND_RETURN_SUSPEND ||
      action === LIVE_LOAD_SUSPEND ||
      action === SWITCH_SUSPEND
    ) {
      dropCanLocation = suspensionLocation;
    } else {
      dropCanLocation = location1;
    }

    if (truck.id) {
      can.truckId = truck.id;
    }

    await Cans[newState === PICKUP_CAN ? PICKUP : DROPOFF](
      can,
      newState === PICKUP_CAN ? truck.location : dropCanLocation,
      user,
      query,
    );

    return next();
  }, user);
});

const setStateHandler = universal.route(201, async req => {
  const {
    location,
    workOrder: { id },
    params: { newState },
    query: queryParams,
    user,
  } = req;
  let wo;
  let newWoAction;
  let newStatus;
  let newDriver;

  const state = workOrderNoteView(
    await my(async query => {
      wo = await findById(id, query);
      newWoAction = wo.action;
      newStatus = wo.status;
      newDriver = wo.driverId;
      // if we are suspending an order and the action is a X SUSPEND
      // set the action to X RESUME, unassign it, remove the driver
      if (newState === SUSPEND_WORK_ORDER && R.contains(wo.action, NEEDS_RESUME)) {
        newWoAction = setResumeAction(wo.action);
        newStatus = 'UNASSIGNED';
        newDriver = null;
      }
      // if we are finishing a resume flow, and the new state is WO COMPLETE
      // and the action is X RESUME, set the status to COMPLETED, remove the
      // driver and put the WO back to its original action ie X not X RESUME
      if (newState === WORK_ORDER_COMPLETE && R.contains(wo.action, NEEDS_ORIGINAL)) {
        newStatus = 'COMPLETED';
        newDriver = null;
        newWoAction = setOriginalAction(wo.action);
      }

      await woUpdate(
        wo.id,
        {
          step: newState,
          action: newWoAction,
          driverId: newDriver,
          status: newStatus,
        },
        user,
        query,
        req,
      );
      return await setState(wo.id, newState, queryParams, location.id, user, query);
    }, user),
  );

  const haulingResponse = await syncOrderWithHauling({ req, workOrder: wo });
  if (haulingResponse) {
    state.haulingResponse = haulingResponse;
  }

  sendSMSOnWorkOrderStart({ req, newState, workOrderId: wo.id, user });
  return Promise.resolve(state);
});

const getWoStateHandler = universal.route(
  200,
  async ({ user, workOrder: { id } }) =>
    await my(async query => {
      const workOrder = await findById(id, query);
      if (!workOrder || R.isEmpty(workOrder)) {
        throw notFound(`WorkOrder with id ${id} does not exist`);
      }
      return await getState(id, query).then(workOrderNoteView);
    }, user),
);

router
  .route('/:newState?')
  .get(authorized([dispatcher.access, driver.access]), getWoStateHandler)
  .post(
    authorized([dispatcher.access, driver.access]),
    validateLocation,
    triggerInventory,
    setStateHandler,
  );

export default router;
