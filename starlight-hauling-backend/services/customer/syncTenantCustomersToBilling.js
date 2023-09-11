import { syncCustomerData } from '../billingProcessor.js';

import CustomerRepo from '../../repos/customer.js';
import TenantRepo from '../../repos/tenant.js';

import getMainPhoneNumber from './utils/getMainPhoneNumber.js';

const syncTenantCustomersToBilling = async (ctx, schemaName) => {
  const schema = await TenantRepo.getInstance(ctx.state).getBy({
    condition: {
      name: schemaName,
    },
  });

  if (!schema) {
    return;
  }

  const customerRepo = CustomerRepo.getInstance(ctx.state, { schemaName });
  const stream = customerRepo.streamAllData({ fields: ['id', 'businessName'] });

  stream.on('data', data => {
    const { id, contactPhoneNumbersArr, customerPhoneNumbersArr } = data;

    const commercial = customerRepo.isCommercial(data);
    const mainPhoneNumber = getMainPhoneNumber(
      commercial ? customerPhoneNumbersArr : contactPhoneNumbersArr,
    );

    syncCustomerData(ctx, { id, mainPhoneNumber, schemaName });
  });

  stream.once('error', err => {
    ctx.logger.error(err, `Customers sync failed. Dropped sync/streaming`);
    stream.destroy();
  });

  stream.once('close', err => {
    ctx.logger.error(err, `Customers sync closed. Dropped sync/streaming`);
  });
};

export default syncTenantCustomersToBilling;
