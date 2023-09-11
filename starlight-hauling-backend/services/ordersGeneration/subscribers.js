import {
  subscriber as orders,
  subscriberNew as subOrders,
} from './generateSubscriptionOrders/subscriber.js';
import { subscriber as workOrders } from './generateSubscriptionWorkOrders/subscriber.js';

export const subscribers = {
  generateSubscriptionOrders: orders,
  generateSubscriptionWorkOrders: workOrders,
  generateSubscriptionOrdersDaily: subOrders,
};

export default subscribers;
