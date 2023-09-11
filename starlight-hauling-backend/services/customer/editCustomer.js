import pick from 'lodash/pick.js';

import knex from '../../db/connection.js';

import CustomerRepo from '../../repos/customer.js';
import LinkedCustomerRepo from '../../repos/linkedCustomers.js';

import { nonCommercialFields, commercialFields } from '../../consts/customerFields.js';

import TermsAndConditionsRepository from '../../repos/termsAndConditions.js';
import { handleLinkedCustomers } from './utils/handleLinkedCustomers.js';

export const editCustomer = async (ctx, options) => {
  const { concurrentData } = ctx;
  const { id, tenantId, body } = options;
  const { commercial, contactId, linkedCustomerIds } = body;

  const data = commercial ? pick(body, commercialFields) : pick(body, nonCommercialFields);
  data.contactId = contactId;

  if (data.gradingRequired) {
    data.gradingNotification = true;
  }

  const customerRepo = CustomerRepo.getInstance(ctx.state);
  const termsAndConditionsRepo = TermsAndConditionsRepository.getInstance(ctx.state);
  const linkedCustomersRepo = LinkedCustomerRepo.getInstance(ctx.state);
  const trx = await knex.transaction();

  try {
    if (data.termsAndConditions) {
      const cst = await customerRepo.getBy({ condition: { id }, fields: ['tcId'] });
      if (!cst.tcId) {
        const newTermsConditions = await termsAndConditionsRepo.createOne({
          data: data.termsAndConditions,
        });
        data.tcId = newTermsConditions.id;
        delete data.termsAndConditions;
      } else {
        const updateTermsConditions = await termsAndConditionsRepo.updateOne({
          condition: { id: cst.tcId },
          data: data.termsAndConditions,
          fiels: data.termsAndConditions,
        });
        data.tcId = updateTermsConditions.id;
      }
    }
    delete data.termsAndConditions;
    const updatedCustomer = await customerRepo.updateOne(
      {
        condition: { id },
        concurrentData,
        data,
        commercial,
        tenantId,
        log: true,
      },
      trx,
    );

    await handleLinkedCustomers(
      { repo: linkedCustomersRepo, linkedCustomerIds, customerId: id },
      trx,
    );

    await trx.commit();

    return updatedCustomer;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
