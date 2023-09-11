import { subscriber as syncToDispatch } from './syncSubscriptionWosToDispatch/subscriber.js';
import { subscriber as syncFromDispatch } from './syncSubscriptionWosFromDispatch/subscriber.js';
import { subscriber as syncServiceItemsFromDispatch } from './syncServiceItemsFromDispatch/subscriber.js';

import { subscriber as syncIndependentFromDispatch } from './syncIndependentWoFromDispatch/subscriber.js';
import { subscriber as syncIndependentToDispatch } from './syncIndependentWoToDispatch/subscriber.js';

export const subscribers = {
  syncToDispatch, // TODO: move this stub to test mocks when routePlanner service will be done
  syncFromDispatch,
  syncIndependentToDispatch,
  syncIndependentFromDispatch,
  syncServiceItemsFromDispatch,
};

export default subscribers;
