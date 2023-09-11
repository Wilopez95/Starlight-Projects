import httpStatus from 'http-status';
import map from 'lodash/map.js';
import compact from 'lodash/compact.js';
import pick from 'lodash/pick.js';

import CustomerJobSitePairRepo from '../../../../repos/customerJobSitePair.js';
import CustomerTaxExemptionRepo from '../../../../repos/customerTaxExemptions.js';
import JobSiteRepo from '../../../../repos/jobSite.js';

import { applyTenantToIndex, search } from '../../../../services/elasticsearch/ElasticSearch.js';
import * as billingService from '../../../../services/billing.js';

import { TENANT_INDEX } from '../../../../consts/searchIndices.js';

const LINKED_CUSTOMERS_PER_PAGE = 25;

const pairFieldsForBilling = [
  'id',
  'jobSiteId',
  'customerId',
  'sendInvoicesToJobSite',
  'invoiceEmails',
];

export const linkJobSite = async ctx => {
  const { schemaName } = ctx.state.user;
  const { customerId, jobSiteId } = ctx.params;
  const { name, ...data } = ctx.request.validated.body; // Removes name field since it's not needed for CustomerJobSite entity.
  const condition = { customerId, jobSiteId };

  const linkedEntity = await CustomerJobSitePairRepo.getInstance(ctx.state).createOne({
    data: { ...condition, ...data },
    condition,
    log: true,
  });

  if (linkedEntity) {
    await billingService.upsertCustomerJobSitePair(ctx, {
      schemaName,
      ...pick(linkedEntity, pairFieldsForBilling),
    });
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = linkedEntity;
};

export const editCustomerJobSitePair = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const data = ctx.request.validated.body;
  const { id } = ctx.params;

  const linkedEntity = await CustomerJobSitePairRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  if (linkedEntity) {
    await billingService.upsertCustomerJobSitePair(ctx, {
      schemaName,
      ...pick(linkedEntity, pairFieldsForBilling),
    });
  }

  ctx.sendObj(linkedEntity);
};

export const getCustomerJobSitePairById = async ctx => {
  const { customerId, cjsPairId } = ctx.params;

  const linkedJobSites = await JobSiteRepo.getInstance(ctx.state).getLinkedWithCustomerPaginated({
    condition: { customerId, ids: [cjsPairId], skip: 0, limit: 1 },
  });

  ctx.sendObj(linkedJobSites?.[0]);
};

export const getAllCustomerJobSitePairs = async ctx => {
  const { customerId } = ctx.params;
  const condition = { customerId };
  const { activeOnly } = ctx.request.query;
  activeOnly && (condition.active = true);

  const linkedJobSites = await JobSiteRepo.getInstance(ctx.state).getLinkedWithCustomerPaginated({
    condition,
  });

  ctx.sendArray(linkedJobSites);
};

export const getCustomerJobSitePairs = async ctx => {
  const { customerId } = ctx.params;
  const { skip = 0, limit = LINKED_CUSTOMERS_PER_PAGE, activeOnly, mostRecent } = ctx.request.query;
  const condition = { customerId };
  activeOnly && (condition.active = true);

  const linkedJobSites = await JobSiteRepo.getInstance(ctx.state).getLinkedWithCustomerPaginated({
    condition,
    skip: Number(skip),
    limit: Number(limit),
    mostRecent,
  });

  ctx.sendArray(linkedJobSites);
};

export const searchLinkedJobSites = async ctx => {
  const { schemaName } = ctx.state.user;
  const { customerId } = ctx.params;
  const { address, activeOnly } = ctx.request.query;
  const condition = { customerId };
  activeOnly && (condition.active = true);

  const results = await search(
    ctx,
    TENANT_INDEX.jobSites,
    applyTenantToIndex(TENANT_INDEX.jobSites, schemaName),
    {
      query: address,
      limit: 25, // TODO: reason about
    },
  );

  const { jobSites } = results;
  if (!jobSites?.length) {
    return ctx.sendArray([], httpStatus.OK);
  }

  const ids = map(jobSites, 'id');

  const linkedJobSites = await JobSiteRepo.getInstance(ctx.state).getLinkedWithCustomerPaginated({
    condition: { ...condition, ids },
  });

  if (!linkedJobSites?.length) {
    return ctx.sendArray([], httpStatus.OK);
  }

  // re-sort by original ids' order
  const sortedArray = Array.from({ length: ids.length });
  linkedJobSites.forEach(item => (sortedArray[ids.indexOf(String(item.id))] = item));

  const resultingArray = compact(sortedArray);
  return ctx.sendArray(resultingArray?.length ? resultingArray : [], httpStatus.OK);
};

export const getCustomerJobSiteAvailableDistricts = async ctx => {
  const { customerId, jobSiteId } = ctx.params;

  const customerJobSitePair = await CustomerJobSitePairRepo.getInstance(ctx.state).getBy({
    condition: { customerId, jobSiteId },
  });

  let taxDistricts = [];
  if (customerJobSitePair?.taxDistricts) {
    ({ taxDistricts } = customerJobSitePair);
  } else {
    const jobSite = await JobSiteRepo.getInstance(ctx.state).getBy({
      condition: { id: jobSiteId },
    });

    if (jobSite?.taxDistricts) {
      ({ taxDistricts } = jobSite);
    }
  }

  if (taxDistricts?.length) {
    const exemptedDistrictsIds = await CustomerTaxExemptionRepo.getInstance(
      ctx.state,
    ).getExemptedDistricts({
      customerId,
      customerJobSiteId: customerJobSitePair?.id,
      taxDistrictIds: taxDistricts.map(district => district.id),
    });

    taxDistricts = taxDistricts.filter(({ id }) => !exemptedDistrictsIds.includes(id));
  }

  ctx.sendArray(taxDistricts);
};
