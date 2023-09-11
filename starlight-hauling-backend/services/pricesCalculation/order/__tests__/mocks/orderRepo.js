import cloneDeep from 'lodash/cloneDeep.js';
import { orderWithAllSubitems } from './data/orders.js';

const orders = {
  18921: orderWithAllSubitems,
};

const OrdersRepo = {
  getInstance() {
    return {
      getBy({ condition: { id } }) {
        return cloneDeep(orders[id]);
      },
    };
  },
};

export default OrdersRepo;
