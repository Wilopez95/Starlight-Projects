import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import pick from 'lodash/pick.js';
import * as dateFns from 'date-fns';
//eslint-disable-next-line
import datefnstz from 'date-fns-tz';

import { getPaymentGateway } from '../paymentGateways/factory.js';
import { sendFailedPaymentNotifications } from '../email.js';
import { generateCcBankDeposits } from '../bankDeposits.js';
import { updateRecurrentOrderStatus } from '../core.js';
import { payInvoices } from '../autoPayInvoices.js';

import { chargeDeferredPayment, createPaymentsForNewOrders } from '../../graphql/mutations.js';

import { BankDepositType } from '../../consts/bankDepositTypes.js';

import { getScopedModels } from '../../utils/getScopedModels.js';
import { createTenantFolder, createUserFolder } from '../reporting/exago.js';
import { logger } from '../../utils/logger.js';

import ApplicationError from '../../errors/ApplicationError.js';

const logError = logger.error.bind(logger);

export const updateOrderTotals = async (ctx, { schemaName, orderId, ...newTotals }) => {
  const { Order } = getScopedModels(schemaName);

  newTotals &&
    Object.entries(newTotals).forEach(([key, value]) => {
      if (key.toLowerCase().endsWith('total')) {
        newTotals[key] = Number(value);
      }
    });

  await Order.patchById(orderId, newTotals).catch(logError);
};

// eslint-disable-next-line no-unused-vars
export const updateCompany = async (ctx, { legalName, ...data } = {}) => {
  const { Company } = ctx.state.models;
  await Company.upsert(data).catch(logError);
};

export const upsertBusinessUnit = async (ctx, { schemaName, ...data }) => {
  const { BusinessUnit } = getScopedModels(schemaName);

  delete data.tenantId;
  delete data.tenantName;
  delete data.loginUrl;

  await BusinessUnit.upsertOne({ data }).catch(logError);
};

export const upsertCustomerJobSitePair = async (ctx, { schemaName, ...data }) => {
  const { CustomerJobSite } = getScopedModels(schemaName);

  await CustomerJobSite.upsertOne(data).catch(logError);
};

export const upsertJobSite = async (ctx, { schemaName, ...data }) => {
  const { JobSite } = getScopedModels(schemaName);

  await JobSite.upsert(data).catch(logError);
};

export const upsertCustomer = async (ctx, { schemaName, ...data }) => {
  const { Customer } = getScopedModels(schemaName);
  delete data.ccProfileId;
  delete data.name;

  await Customer.upsertOne(data).catch(logError);
};

export const lineOfBusiness = async (ctx, { schemaName, data }) => {
  const { BusinessLine } = getScopedModels(schemaName);

  const businessLines = data?.map(businessLine =>
    pick(businessLine, ['id', 'active', 'name', 'description', 'shortName', 'type']),
  );

  if (businessLines?.length) {
    await BusinessLine.upsertMany({ data: businessLines }).catch(logError);
  }
};

const checkScheduledTimeForRun = ({
  timeZoneName,
  targetTime,
  maxAllowedGapInMins,
  logResult = null,
}) => {
  const zonedCurrentDate = datefnstz.utcToZonedTime(new Date(), timeZoneName);

  const [h, m, s] = targetTime.split(':');
  const targetDate = datefnstz.utcToZonedTime(
    dateFns.set(new Date(), { hours: h, minutes: m, seconds: s }),
    timeZoneName,
  );

  const result =
    Math.abs(dateFns.differenceInMinutes(zonedCurrentDate, targetDate)) < maxAllowedGapInMins;

  if (logResult) {
    logger.info(
      `Schedule time check for ${logResult?.method} with data: timeZoneName ${timeZoneName}, targetTime ${targetTime}, maxAllowedGapInMins ${maxAllowedGapInMins} ended with result ${result}`,
    );
  }

  return result;
};

const checkTimeAndApplyToTenant =
  (cb, jobName) =>
  async (ctx, { targetTime, maxAllowedGapInMins = 10 } = {}) => {
    if (!targetTime) {
      return ctx.logger.error(`Target time is missed for ${jobName} job`);
    }

    const { Tenant } = getScopedModels();

    const tenants = await Tenant.getAllWithCompany();

    if (isEmpty(tenants)) {
      return ctx.logger.info(`None tenants or tenants' company info present`);
    }

    await Promise.allSettled(
      tenants.map(tenant => {
        const localCtx = {
          ...ctx,
          state: {
            ...ctx.state,
            user: {
              ...ctx.state.user,
              schemaName: tenant.name,
              subscriberName: tenant.name,
              tenantId: Number(tenant.id),
            },
            models: getScopedModels(tenant.name),
          },
        };
        return cb(localCtx, tenant, { targetTime, maxAllowedGapInMins });
      }),
    );
    return true;
  };

export const requestBusinessUnitSettlementForMerchant = async (
  ctx,
  merchant,
  { businessUnitId, date, merchantId, tenantId, mid, spUsed } = {},
  { Settlement, BankDeposit },
) => {
  const settlementExists = await Settlement.exists({
    condition: { date, merchantId, businessUnitId, mid, spUsed },
  });
  if (settlementExists) {
    throw ApplicationError.conflict(`Settlement for ${date} already exists`);
  }

  const gateway = getPaymentGateway(ctx, { ...merchant, spUsed });

  const settlementData = await gateway.requestSettlement({ date });
  settlementData.settlementTransactions = settlementData?.settlementTransactions?.map(element => {
    element.spUsed = spUsed;
    return element;
  });

  let settlement;
  try {
    settlement = await Settlement.createSettlement({
      data: { ...settlementData, businessUnitId, merchantId, mid, spUsed },
    });
  } catch (error) {
    ctx.logger.error('Failed to create settlement');

    throw error;
  }

  let bankDeposit;
  try {
    bankDeposit = await generateCcBankDeposits(
      ctx,
      { Settlement, BankDeposit },
      { settlementId: settlement.id, mid },
      { tenantId },
    );
  } catch (error) {
    ctx.logger.error('Failed to generate cc bank deposits');

    // settlement is not possible without cc bank deposit
    await Settlement.deleteById(settlement.id).catch(err =>
      ctx.logger.error(err, 'Failed to delete settlement'),
    );

    throw error;
  }

  const action = Settlement.logAction.create;
  const userId = 'system;';
  settlement?.$log({ userId, action });
  bankDeposit?.id &&
    BankDeposit?.log({
      id: bankDeposit.id,
      userId,
      action,
      entity: BankDeposit.logEntity.bankDeposits,
    });
};
export const getMerchantIdsForRequestSettlement = merchant => {
  const mids = [];
  if (merchant.mid) {
    mids.push({
      mid: merchant.mid,
      spUsed: !!merchant.salespointMid && merchant.mid === merchant.salespointMid,
    });
  }
  if (merchant.salespointMid && merchant.mid !== merchant.salespointMid) {
    mids.push({ mid: merchant.salespointMid, spUsed: true });
  }
  return mids;
};

const requestBusinessUnitSettlement = async (
  ctx,
  { businessUnitId, date, merchantId, tenantId } = {},
  { Merchant, Settlement, BankDeposit },
) => {
  const merchant = await Merchant.getById(merchantId);
  if (!merchant) {
    throw ApplicationError.notFound(`Merchant ${merchantId} not found`);
  }

  const mids = getMerchantIdsForRequestSettlement(merchant);
  if (mids.length) {
    await Promise.all(
      mids.map(({ mid, spUsed }) =>
        requestBusinessUnitSettlementForMerchant(
          ctx,
          merchant,
          {
            businessUnitId,
            date,
            merchantId,
            tenantId,
            mid,
            spUsed,
          },
          {
            Settlement,
            BankDeposit,
          },
        ),
      ),
    );
  }
};

export const autoRequestTenantSettlement = async (
  ctx,
  { id: tenantId, name: schemaName, company },
  { targetTime, maxAllowedGapInMins, skipTimeCheck = false },
) => {
  const { timeZoneName: companyTimeZoneName = 'UTC' } = company ?? {};
  try {
    const allBusinessUnits = await ctx.models.BusinessUnit.getAll();

    const businessUnits = allBusinessUnits.filter(({ timeZoneName }) =>
      skipTimeCheck
        ? true
        : checkScheduledTimeForRun({
            timeZoneName: timeZoneName || companyTimeZoneName,
            targetTime,
            maxAllowedGapInMins,
          }),
    );

    if (!businessUnits?.length) {
      return;
    }
    const results = await Promise.allSettled(
      businessUnits
        .filter(bu => bu.merchantId)
        .map(bu =>
          requestBusinessUnitSettlement(
            ctx,
            {
              businessUnitId: bu.id,
              date: dateFns.subDays(new Date(), 1),
              merchantId: bu.merchantId,
              tenantId,
            },
            ctx.models,
          ),
        ),
    );

    results.forEach(({ status, reason }, index) => {
      if (status === 'rejected') {
        ctx.logger.error(
          reason,
          `Failed to generate settlements for bu: ${businessUnits[index].id} & merchant: ${businessUnits[index].merchantId}`,
        );
      }
    });
  } catch (error) {
    ctx.logger.error(
      error,
      `Unexpected rejection while requesting settlements for tenant ${schemaName}`,
    );
  }
};

export const autoRequestSettlements = checkTimeAndApplyToTenant(
  autoRequestTenantSettlement,
  'Autorequest Settlements',
);

export const chargeTenantDeferredPayments = async (
  ctx,
  { name: schemaName, company },
  { targetTime, maxAllowedGapInMins, skipTimeCheck = false },
) => {
  const { timeZoneName: companyTimeZoneName = 'UTC' } = company ?? {};

  const chargablePayments = await ctx.models.Payment.getAllForCharge();

  const payments = chargablePayments.filter(({ businessUnit }) =>
    skipTimeCheck
      ? true
      : checkScheduledTimeForRun({
          timeZoneName: businessUnit?.timeZoneName || companyTimeZoneName,
          targetTime,
          maxAllowedGapInMins,
        }),
  );

  if (isEmpty(payments)) {
    return;
  }

  const logErrorMessage = error =>
    ctx.logger.error(
      error,
      `Unexpected rejection while charging deferred payments of tenant ${schemaName}`,
    );

  const failedPayments = [];
  // requests to CC are not "parallel" in order to avoid any race conditions
  for (const { id: paymentId } of payments) {
    try {
      await chargeDeferredPayment(ctx, { paymentId }, { log: true });
    } catch (error) {
      logErrorMessage(error);
      failedPayments.push(paymentId);
    }
  }

  if (!isEmpty(failedPayments)) {
    await sendFailedPaymentNotifications(ctx, { paymentIds: failedPayments });
  }
};

export const chargeDeferredPayments = checkTimeAndApplyToTenant(
  chargeTenantDeferredPayments,
  'Charge Deferred Payments',
);

export const lockTenantBankDeposits = async (
  ctx,
  { id: tenantId, name: schemaName, company },
  { targetTime, maxAllowedGapInMins, skipTimeCheck = false },
) => {
  const { timeZoneName: companyTimeZoneName = 'UTC' } = company ?? {};
  const { BusinessUnit, BankDeposit } = ctx.state.models;

  try {
    const allBusinessUnits = await BusinessUnit.getAll();

    const businessUnits = allBusinessUnits.filter(({ timeZoneName }) =>
      skipTimeCheck
        ? true
        : checkScheduledTimeForRun({
            timeZoneName: timeZoneName || companyTimeZoneName,
            targetTime,
            maxAllowedGapInMins,
            logResult: { method: 'Lock bank deposit' },
          }),
    );

    if (isEmpty(businessUnits)) {
      return;
    }

    try {
      await BankDeposit.lockAllPastDeposits(
        ctx,
        {
          tenantId,
          businessUnitIds: map(businessUnits, 'id'),
        },
        { log: true, userId: 'system' },
      );
    } catch (error) {
      ctx.logger.error(error, 'Failed to lock all past deposits');
    }

    await Promise.allSettled(
      businessUnits.flatMap(({ id }) => [
        BankDeposit.upsertAndFetchCurrentDeposit({
          condition: { businessUnitId: Number(id), type: BankDepositType.CASH_CHECK },
        }),
        BankDeposit.upsertAndFetchCurrentDeposit({
          condition: { businessUnitId: Number(id), type: BankDepositType.REVERSAL },
        }),
      ]),
    );
  } catch (error) {
    ctx.logger.error(
      error,
      `Unexpected rejection while creating fresh bank deposits for tenant ${schemaName}`,
    );
  }
};

export const lockBankDeposits = checkTimeAndApplyToTenant(
  lockTenantBankDeposits,
  'Lock Bank Deposits',
);

export const createPaymentsForRecurrentOrders = async (
  ctx,
  { schemaName, tenantId, customerId, orders, payments },
) => {
  const userId = 'system';

  try {
    await createPaymentsForNewOrders(ctx, { orders, customerId, payments }, { log: true, userId });

    const results = await Promise.allSettled(
      orders.map(order =>
        updateRecurrentOrderStatus(ctx, {
          orderId: order.id,
          schemaName,
          tenantId,
          status: 'success',
        }),
      ),
    );

    results.forEach(({ status, reason }) => {
      if (status === 'rejected') {
        ctx.logger.error(reason, `Failed to send updateRecurrentOrderStatus message to queue`);
      }
    });
  } catch (error) {
    ctx.logger.error(error, 'Failed to create payments for recurrent orders');

    await Promise.all(
      orders.map(order =>
        updateRecurrentOrderStatus(ctx, {
          orderId: order.id,
          schemaName,
          tenantId,
          status: 'failure',
        }),
      ),
    );
  }
};

export const createTenant = async (ctx, { id, name, legalName, region }) => {
  const { Tenant } = getScopedModels();

  try {
    await Tenant.createOne({ data: { id, name, legalName, region }, fields: [] });
    await createTenantFolder(ctx, name);

    ctx.logger.info(`Created tenant ${name}`);
  } catch (error) {
    ctx.logger.error(error, 'Error creating tenant');
  }
};

export const autoPayTenantInvoices = async (
  ctx,
  { name: schemaName },
  { targetTime, maxAllowedGapInMins, skipTimeCheck = false },
) => {
  try {
    if (
      !skipTimeCheck &&
      !checkScheduledTimeForRun({
        timeZoneName: Intl.DateTimeFormat().resolvedOptions().timeZone,
        targetTime,
        maxAllowedGapInMins,
      })
    ) {
      return;
    }

    const { Customer } = ctx.state.models;
    const customers = await Customer.getByLastInvoicesForAutoPay();

    if (!customers?.length) {
      return;
    }

    await Promise.all(
      customers.map(async customer => {
        const { invoices, id: customerId } = customer;

        if (!invoices?.length) {
          return;
        }

        try {
          await payInvoices(ctx, { invoices, customer });
        } catch (error) {
          ctx.logger.error(
            error,
            `Error while executing Auto Pay cron job for customer ${customerId} of tenant ${schemaName}`,
          );
        }
      }),
    );
  } catch (error) {
    ctx.logger.error(error, `Error while executing Auto Pay cron job of tenant ${schemaName}`);
  }
};

export const autoPayInvoices = checkTimeAndApplyToTenant(
  autoPayTenantInvoices,
  'Auto pay invoices',
);

export const deleteTenant = async (ctx, { name }) => {
  const { Tenant } = getScopedModels();

  try {
    await Tenant.deleteOne({ condition: { name } });

    ctx.logger.info(`Deleted tenant ${name}`);
  } catch (error) {
    ctx.logger.error(error, 'Error deleting tenant');
  }
};

export const updateBusinessUnitMailSettings = async (ctx, { schemaName, ...data }) => {
  const { BusinessUnitMailSettings } = getScopedModels(schemaName);

  await BusinessUnitMailSettings.upsert(data).catch(logError);
};

export const createUserFolderOnExago = async (ctx, { action, data: { email, tenantName } }) => {
  if (action === 'create') {
    await createUserFolder(ctx, { schema: tenantName, userEmail: email });
  }
};
