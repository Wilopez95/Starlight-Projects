import EventEmitter from 'events';

import { SUBSCRIPTION_HISTORY_EVENT } from '../../consts/subscriptionHistoryEvents.js';
import { logAdditionalAction } from './logAdditionalAction.js';
import { logAddAnnualReminder } from './logReminder.js';
import { logSubscriptionUpdates } from './logSubscriptionUpdates.js';

export const subscriptionHistoryEmitter = new EventEmitter();

subscriptionHistoryEmitter.on(SUBSCRIPTION_HISTORY_EVENT.additionalAction, logAdditionalAction);
subscriptionHistoryEmitter.on(SUBSCRIPTION_HISTORY_EVENT.addAnnualReminder, logAddAnnualReminder);
subscriptionHistoryEmitter.on(
  SUBSCRIPTION_HISTORY_EVENT.subscriptionUpdated,
  logSubscriptionUpdates,
);
