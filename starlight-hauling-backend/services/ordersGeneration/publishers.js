import { publisher as orders } from './generateSubscriptionOrders/publisher.js';
import { publisher as workOrders } from './generateSubscriptionWorkOrders/publisher.js';

export const publishers = {
  generateSubscriptionOrders: orders,
  generateSubscriptionWorkOrders: workOrders,
};
