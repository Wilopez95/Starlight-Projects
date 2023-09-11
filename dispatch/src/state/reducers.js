/* eslint-disable import/max-dependencies */
import { combineReducers } from 'redux';
import { cans } from './modules/cans';
import { constants } from './modules/constants';
import { dispatcher } from './modules/dispatcher';
import { invboard } from './modules/invboard';
import { driver } from './modules/driver';
import { drivers } from './modules/drivers';
import { workOrders } from './modules/workOrders';
import { locations } from './modules/locations';
import { setting } from './modules/settings';
import { materials } from './modules/materials';
import { session } from './modules/session';
import { templates } from './modules/templates';
import { driverhauls } from './modules/driverhauls';
import { workOrderNotes } from './modules/workOrderNotes';
import { workOrderServices } from './modules/services';
import { lobby } from './modules/lobby';

export default function createReducer(injectedReducers = {}) {
  return combineReducers({
    ...injectedReducers,
    cans,
    constants,
    dispatcher,
    driver,
    drivers,
    workOrders,
    invboard,
    locations,
    setting,
    materials,
    templates,
    session,
    driverhauls,
    workOrderNotes,
    workOrderServices,
    lobby,
  });
}
