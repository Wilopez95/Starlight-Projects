import httpStatus from 'http-status';
import camelCase from 'lodash/fp/camelCase.js';

import TaxDistrictRepo from '../../../repos/taxDistrict.js';
import CustomerJobSitePairRepo from '../../../repos/customerJobSitePair.js';
import CustomerTaxExemptionRepo from '../../../repos/customerTaxExemptions.js';
import JobSiteRepo from '../../../repos/jobSite.js';
import OriginDistrictRepo from '../../../repos/originDistrict.js';

import { applyTenantToIndex, search } from '../../../services/elasticsearch/ElasticSearch.js';

import ApiError from '../../../errors/ApiError.js';

import { NON_TENANT_INDEX } from '../../../consts/searchIndices.js';
import { TAX_KIND, TAX_APPLICATION, TAX_CALCULATION } from '../../../consts/taxDistricts.js';
import { ORDER_STATUS } from '../../../consts/orderStatuses.js';

export const getTaxDistrictById = async ctx => {
  const { id } = ctx.params;

  const taxes = await TaxDistrictRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(taxes?.[0]);
};

export const getTaxDistricts = async ctx => {
  const condition = ctx.getRequestCondition();
  if (ctx.request.query.activeOnly) {
    condition.active = true;
  }

  const taxes = await TaxDistrictRepo.getInstance(ctx.state).getAllWithTaxes({
    condition,
    orderBy: [{ column: 'description', order: 'desc' }],
  });

  ctx.sendArray(taxes);
};

export const createTaxDistrict = async ctx => {
  const data = ctx.request.validated.body;

  const newTaxDistrict = await TaxDistrictRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newTaxDistrict;
};

export const editTaxDistrict = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;

  const updatedTaxDistrict = await TaxDistrictRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  if (!updatedTaxDistrict) {
    throw ApiError.notFound();
  }

  ctx.sendObj(updatedTaxDistrict);
};

export const editTaxDistrictTaxes = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  let { key } = ctx.params;
  const {
    commercial,
    group,
    calculation,
    application,
    value,
    nonGroup,
    exclusions,
    businessLineId,
  } = ctx.request.validated.body;

  key = camelCase(key);

  if (
    key === TAX_KIND.lineItems &&
    !group &&
    application === TAX_APPLICATION.order &&
    calculation !== TAX_CALCULATION.flat
  ) {
    throw ApiError.invalidRequest(
      'Invalid configuration for line item taxes',
      'Per order application can only be used with flat taxes',
    );
  }

  if (key !== TAX_KIND.lineItems && group && !Array.isArray(exclusions)) {
    throw ApiError.invalidRequest('"exclusions" must be an array');
  }

  if (key === TAX_KIND.lineItems && group && Array.isArray(exclusions)) {
    throw ApiError.invalidRequest('"exclusions" can not be an array for line items');
  }

  if (key !== TAX_KIND.lineItems && !group && !Array.isArray(nonGroup)) {
    throw ApiError.invalidRequest('"nonGroup" must be an array');
  }

  if (key === TAX_KIND.lineItems && !group && Array.isArray(nonGroup)) {
    throw ApiError.invalidRequest('"nonGroup" can not be an array for line items');
  }

  const updatedTaxes = await TaxDistrictRepo.getInstance(ctx.state).updateTaxesDetails({
    id,
    concurrentData,
    key,
    details: {
      commercial,
      group,
      calculation,
      application,
      value,
      nonGroup,
      exclusions,
      businessLineId,
    },
    log: true,
  });

  ctx.sendObj(updatedTaxes);
};

export const deleteTaxDistrict = async ctx => {
  const { id } = ctx.params;

  await TaxDistrictRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const searchAdministrativeUnits = async ctx => {
  const { level, query, region } = ctx.request.query;

  const results = await search(
    ctx,
    NON_TENANT_INDEX.administrative,
    applyTenantToIndex(NON_TENANT_INDEX.administrative, region),
    {
      query,
      level,
    },
  );

  ctx.sendArray(results && results.administrative);
};

export const getTaxesQBData = async ctx => {
  const { joinHistoricalTableIds } = ctx.request.validated.query;

  let taxes;
  if (joinHistoricalTableIds) {
    taxes = await TaxDistrictRepo.getInstance(ctx.state).getAllWithHistorical({
      condition: {},
      fields: ['id', 'description', 'districtType'],
    });
  } else {
    taxes = await TaxDistrictRepo.getInstance(ctx.state).getAll({
      condition: {},
      fields: ['id', 'description', 'districtType'],
    });
  }

  ctx.sendArray(taxes);
};

export const getTaxesSumQBData = async ctx => {
  const { rangeFrom, rangeTo, integrationBuList } = ctx.request.validated.query;

  const taxesSum = await TaxDistrictRepo.getInstance(ctx.state).getQBSum({
    condition: {
      rangeFrom,
      rangeTo,
      integrationBuList,
      // since we integrate with qb data only from invoiced orders
      orderStatus: ORDER_STATUS.invoiced,
    },
  });

  ctx.sendArray(taxesSum);
};

export const getRecyclingDistricts = async ctx => {
  const { customerId, jobSiteId, originDistrictId } = ctx.request.validated.query;

  let taxDistricts = [];

  let customerJobSitePair;

  if (customerId && jobSiteId) {
    customerJobSitePair = await CustomerJobSitePairRepo.getInstance(ctx.state).getBy({
      condition: { customerId, jobSiteId },
    });

    if (customerJobSitePair?.taxDistricts?.length) {
      taxDistricts = taxDistricts.concat(customerJobSitePair.taxDistricts);
    } else {
      const jobSite = await JobSiteRepo.getInstance(ctx.state).getBy({
        condition: { id: jobSiteId },
      });

      if (jobSite?.taxDistricts?.length) {
        taxDistricts = taxDistricts.concat(jobSite.taxDistricts);
      }
    }
  }

  if (originDistrictId && (!jobSiteId || !taxDistricts.length)) {
    const taxDistrict = await OriginDistrictRepo.getInstance(
      ctx.state,
    ).getTaxDistrictByOriginDistrict({
      condition: { id: originDistrictId },
    });

    if (taxDistrict) {
      taxDistricts.push(taxDistrict);
    }
  }

  if (taxDistricts.length) {
    const exemptedDistrictsIds = await CustomerTaxExemptionRepo.getInstance(
      ctx.state,
    ).getExemptedDistricts({
      customerId,
      customerJobSiteId: customerJobSitePair?.id,
      taxDistrictIds: taxDistricts.map(district => district.id),
      useCustomerJobSite: !!jobSiteId,
    });

    taxDistricts = taxDistricts.filter(({ id }) => !exemptedDistrictsIds.includes(id));
  }

  ctx.sendArray(taxDistricts);
};
