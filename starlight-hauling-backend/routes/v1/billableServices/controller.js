import httpStatus from 'http-status';

import isEmpty from 'lodash/isEmpty.js';
import { ACTION } from '../../../consts/actions.js';
import { COE_ALLOWED_BY_ACTION } from '../../../consts/equipmentTypes.js';

import BillableServiceRepo from '../../../repos/billableService.js';
import BillableServiceFrequencyRepo from '../../../repos/billableServiceFrequency.js';
import BillingCyclesFrequenciesRepo from '../../../repos/billingCyclesFrequencies.js';
import EquipmentItemRepo from '../../../repos/equipmentItem.js';
import BusinessLineRepo from '../../../repos/businessLine.js';

import ApiError from '../../../errors/ApiError.js';

const validateBillableServiceData = async (ctx, currentServiceId) => {
  const {
    frequencies,
    services,
    billingCycles,
    action,
    oneTime,
    equipmentItemId,
    businessLineId,
    spUsed,
  } = ctx.request.validated.body;

  const [equipment, bl, existingServices] = await Promise.all([
    EquipmentItemRepo.getInstance(ctx.state).getById({
      id: equipmentItemId,
    }),
    BusinessLineRepo.getInstance(ctx.state).getById({
      id: businessLineId,
      fields: ['spUsed'],
    }),
    BillableServiceRepo.getInstance(ctx.state).getAll({
      condition: {
        equipmentItemId,
        spUsed: true,
      },
    }),
  ]);

  if (spUsed) {
    if (!bl.spUsed) {
      throw ApiError.invalidRequest(
        'Cannot set Service for use in SP it this business line is not integrated yet',
      );
    }

    if (existingServices?.length >= 1) {
      if (
        !(
          currentServiceId &&
          existingServices.length === 1 &&
          String(existingServices[0].id) === String(currentServiceId)
        )
      ) {
        throw ApiError.invalidRequest(
          'Only one Service can be marked for SP usage for pair action + equipment',
        );
      }
    }
  }

  if (equipment?.customerOwned && !COE_ALLOWED_BY_ACTION.includes(action)) {
    throw ApiError.invalidRequest(
      'Customer Owned Equipment and action mismatch',
      'Provided equipmentId is not covered by allowed actions',
    );
  }

  if (oneTime) {
    return;
  }

  const { frequencyTypes: allowedFrequencyTypes } = await BillingCyclesFrequenciesRepo.getInstance(
    ctx.state,
  ).getAllowedFrequencyTypesByBillingCycle({ billingCycles });

  const hasDisallowedFrequencies =
    Array.isArray(frequencies) &&
    frequencies.some(({ type }) => !allowedFrequencyTypes.includes(type));

  if (hasDisallowedFrequencies) {
    throw ApiError.invalidRequest(
      'Frequencies and billing cycles mismatch',
      'Provided frequencies are not covered by billing cycles',
    );
  }

  if (action === ACTION.rental && !isEmpty(services)) {
    const includedServices = await BillableServiceRepo.getInstance(ctx.state).getAllByIds({
      ids: services,
    });

    const hasDisallowedIncludedServices =
      Array.isArray(includedServices) &&
      includedServices.some(
        service =>
          service.equipmentItemId !== equipmentItemId ||
          ![ACTION.delivery, ACTION.service, ACTION.final].includes(service.action),
      );

    if (hasDisallowedIncludedServices) {
      throw ApiError.invalidRequest(
        'Parent service and included services mismatch',
        'Provided included services have incompatible equipmentItemId and/or action type',
      );
    }
  }
};

export const getBillableServiceById = async ctx => {
  const { id } = ctx.params;

  const service = await BillableServiceRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(service);
};

export const getHistoricalBillableServiceById = async ctx => {
  const { billableServicesId } = ctx.params;
  const condition = ctx.getRequestCondition();
  condition.originalId = billableServicesId;

  const service = await BillableServiceRepo.getHistoricalInstance(ctx.state).getRecentBy({
    condition,
  });

  ctx.sendObj(service);
};

export const getBillableServices = async ctx => {
  const contextCondition = ctx.getRequestCondition();
  const { query } = ctx.request.validated;
  const { activeOnly, materialBasedPricing, ...condition } = query;

  Object.assign(condition, contextCondition);
  if (activeOnly) {
    condition.active = true;
  }

  if ('materialBasedPricing' in query) {
    condition.materialBasedPricing = !!materialBasedPricing;
  }

  if ('frequencyIds' in condition && !Array.isArray(condition.frequencyIds)) {
    condition.frequencyIds = [condition.frequencyIds];
  }

  if ('equipmentItemIds' in condition && !Array.isArray(condition.equipmentItemIds)) {
    condition.equipmentItemIds = [condition.equipmentItemIds];
  }

  const services = await BillableServiceRepo.getInstance(ctx.state).getAllWithIncludes({
    condition,
  });

  ctx.sendArray(services);
};

export const getBillableServiceFrequencies = async ctx => {
  const { id } = ctx.params;
  const { globalRateRecurringServiceId, customRateRecurringServiceId, billingCycle } =
    ctx.request.validated.query;

  const frequencies = await BillableServiceFrequencyRepo.getInstance(
    ctx.state,
  ).getByBillableServiceId({
    condition: { billableServiceId: id },
    nestedCondition: {
      globalRateRecurringServiceId,
      customRateRecurringServiceId,
      billingCycle,
    },
    fields: ['*'],
    nestedFields: ['id', 'times', 'type'],
  });

  ctx.sendArray(frequencies);
};

export const createBillableService = async ctx => {
  const { frequencies, services, billingCycles, ...data } = ctx.request.validated.body;

  await validateBillableServiceData(ctx);

  const repo = BillableServiceRepo.getInstance(ctx.state);
  let newService;
  if (data.oneTime) {
    newService = await repo.createOneTime({ data, log: true });
  } else {
    newService = await repo.createRecurrent({
      data,
      services,
      frequencies,
      billingCycles,
      log: true,
    });
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = newService;
};

export const editBillableService = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { frequencies, services, billingCycles, ...data } = ctx.request.validated.body;

  await validateBillableServiceData(ctx, id);

  const repo = BillableServiceRepo.getInstance(ctx.state);
  let updatedService;
  if (data.oneTime) {
    updatedService = await repo.updateOneTime({
      condition: { id },
      data,
      concurrentData,
      log: true,
    });
  } else {
    updatedService = await repo.updateRecurrent({
      condition: { id },
      data,
      frequencies,
      services,
      billingCycles,
      concurrentData,
      log: true,
    });
  }

  ctx.sendObj(updatedService);
};

export const deleteBillableService = async ctx => {
  const { id } = ctx.params;

  await BillableServiceRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getBillableServicesQBData = async ctx => {
  const { joinHistoricalTableIds } = ctx.request.validated.query;

  let services;
  // remove crpt actions so far
  const hideWithActions = [ACTION.none, ACTION.notService, ACTION.rental, ACTION.service];
  if (joinHistoricalTableIds) {
    services = await BillableServiceRepo.getInstance(ctx.state).getAllWithHistorical({
      condition: {},
      fields: ['id', 'action'],
    });
  } else {
    services = await BillableServiceRepo.getInstance(ctx.state).getAll({
      condition: {},
      fields: ['action'],
      hideWithActions,
    });
  }

  ctx.sendArray(services);
};
