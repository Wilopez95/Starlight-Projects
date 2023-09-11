import {
  getHaulingCustomerById,
  editHaulingCustomer,
} from '../../../services/hauling/customers.js';

export const getCustomerById = async (ctx) => {
  const data = await getHaulingCustomerById(ctx);
  ctx.sendObj(data);
};

export const editCustomer = async (ctx) => {
  const data = await editHaulingCustomer(ctx);
  ctx.sendObj(data);
};
