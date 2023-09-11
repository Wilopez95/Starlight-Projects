import pick from 'lodash/pick.js';

import knex from '../../db/connection.js';

import CustomerRepo from '../../repos/customer.js';
import LinkedCustomerRepo from '../../repos/linkedCustomers.js';

import { nonCommercialFields, commercialFields } from '../../consts/customerFields.js';

import TermsAndConditionsRepository from '../../repos/termsAndConditions.js';
import { handleLinkedCustomers } from './utils/handleLinkedCustomers.js';

export const createCustomer = async (ctx, options) => {
  const { body, tenantId } = options;
  const { commercial, linkedCustomerIds } = body;
  const data = commercial ? pick(body, commercialFields) : pick(body, nonCommercialFields);

  if (data.gradingRequired) {
    data.gradingNotification = true;
  }

  const customerRepo = CustomerRepo.getInstance(ctx.state);
  const termsConditionsRepo = TermsAndConditionsRepository.getInstance(ctx.state);
  const linkedCustomersRepo = LinkedCustomerRepo.getInstance(ctx.state);
  const trx = await knex.transaction();

  try {
    if (data.termsAndConditions) {
      const newTermsConditions = await termsConditionsRepo.createOne({
        data: data.termsAndConditions,
      });
      data.tcId = newTermsConditions.id;
      delete data.termsAndConditions;
    }
    const newCustomer = await customerRepo.createOne(
      {
        data,
        commercial,
        tenantId,
        log: true,
      },
      trx,
    );

    await handleLinkedCustomers(
      { repo: linkedCustomersRepo, linkedCustomerIds, customerId: newCustomer.id },
      trx,
    );

    await trx.commit();

    return newCustomer;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
