import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';

import JobSiteRepo from '../../../repos/jobSite.js';
import CustomerRepo from '../../../repos/customer.js';
import ContactRepository from '../../../repos/contact.js';

import * as billingService from '../../../services/billing.js';
import * as routePlannerPublisher from '../../../services/routePlanner/publishers.js';
import { applyTenantToIndex, search } from '../../../services/elasticsearch/ElasticSearch.js';

import { parseSearchQuery } from '../../../utils/search.js';

import { TENANT_INDEX } from '../../../consts/searchIndices.js';
import { GEOMETRY_TYPE } from '../../../consts/GeometryTypes.js';
import { JOB_SITES_SORTING_ATTRIBUTE } from '../../../consts/jobSitesSotringAttributes.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';

const JOB_SITES_PER_PAGE = 25;
const LINKED_JOB_SITES_PER_PAGE = 6;

const getFiltersData = pick([
  'filterByAlleyPlacement',
  'filterByCabOver',
  'filterByTaxDistrict',
  'filterByServiceArea',
  'filterByZipCodes',
  'filterByState',
  'filterByCity',
  'filterByCoordinates',
  'filterByName',
]);

export const getJobSites = async ctx => {
  const {
    skip = 0,
    limit = JOB_SITES_PER_PAGE,
    query,
    sortBy = JOB_SITES_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.validated.query;

  const jobSites = await JobSiteRepo.getInstance(ctx.state).getAllPaginated({
    skip: Number(skip),
    limit: Math.min(Number(limit), JOB_SITES_PER_PAGE),
    sortBy,
    sortOrder,
    condition: {
      filters: getFiltersData(ctx.request.validated.query),
      ...parseSearchQuery(query),
    },
  });

  ctx.sendArray(jobSites);
};

export const getJobSitesCount = async ctx => {
  const { query } = ctx.request.validated.query;

  const total = await JobSiteRepo.getInstance(ctx.state).jobSitesCount({
    condition: {
      filters: getFiltersData(ctx.request.validated.query),
      ...parseSearchQuery(query),
    },
  });

  ctx.sendObj(total);
};

export const getJobSiteById = async ctx => {
  const { id } = ctx.params;
  const { includeInactiveTaxDistricts, jobSiteContactIdHistorical } = ctx.request.query;

  const jobSite = await JobSiteRepo.getInstance(ctx.state).getBy({
    condition: { id },
    activeTaxDistrictsOnly: !includeInactiveTaxDistricts,
  });
  if (jobSiteContactIdHistorical > 0) {
    const contactHistorical = await ContactRepository.getHistoricalInstance(ctx.state).getRecentBy({
      condition: { id: jobSiteContactIdHistorical },
    });
    jobSite.contactId = contactHistorical.originalId;
  }
  ctx.sendObj(jobSite);
};

export const createJobSite = async ctx => {
  const { schemaName } = ctx.state.user;
  const { linkTo } = ctx.request.validated.query;

  const data = ctx.request.validated.body;
  delete data.address.region;
  Object.assign(data, { coordinates: data.location.coordinates }, data.address);
  delete data.address;

  if (data.geofence) {
    if (data.geofence.type === GEOMETRY_TYPE.radius) {
      Object.assign(data, { radius: data.geofence.radius });
    } else if (data.geofence.type === GEOMETRY_TYPE.polygon) {
      Object.assign(data, { radius: null, polygon: data.geofence });
    } else {
      Object.assign(data, { radius: null, polygon: null });
    }
  } else {
    Object.assign(data, { radius: null, polygon: null });
  }
  delete data.geofence;

  const newJobSite = await JobSiteRepo.getInstance(ctx.state).createOne({
    data,
    linkTo,
    log: true,
  });

  if (newJobSite) {
    const jsDataToMq = {
      schemaName,
      id: newJobSite.id,
      name: newJobSite.name,
      ...newJobSite.address,
    };

    await Promise.all([
      billingService.upsertJobSite(ctx, jsDataToMq),
      routePlannerPublisher.upsertJobSite(ctx, {
        ...jsDataToMq,
        location: newJobSite.location,
        coordinates: newJobSite.coordinates,
      }),
    ]);
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = newJobSite;
};

export const editJobSite = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;

  const data = ctx.request.validated.body;
  delete data.address.region;
  Object.assign(data, { coordinates: data.location.coordinates }, data.address);
  delete data.address;

  if (data.geofence) {
    if (data.geofence.type === GEOMETRY_TYPE.radius) {
      Object.assign(data, { radius: data.geofence.radius, polygon: null });
    } else if (data.geofence.type === GEOMETRY_TYPE.polygon) {
      Object.assign(data, { radius: null, polygon: data.geofence });
    } else {
      Object.assign(data, { radius: null, polygon: null });
    }
  } else {
    Object.assign(data, { radius: null, polygon: null });
  }
  delete data.geofence;

  const updatedJobSite = await JobSiteRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  if (updatedJobSite) {
    const jsDataToMq = {
      schemaName,
      id: updatedJobSite.id,
      name: updatedJobSite.name,
      ...updatedJobSite.address,
    };

    await Promise.all([
      billingService.upsertJobSite(ctx, jsDataToMq),
      routePlannerPublisher.upsertJobSite(ctx, {
        ...jsDataToMq,
        location: updatedJobSite.location,
        coordinates: updatedJobSite.coordinates,
      }),
    ]);
  }

  ctx.sendObj(updatedJobSite);
};

export const searchJobSites = async ctx => {
  const { schemaName } = ctx.state.user;
  const { address } = ctx.request.query;

  const jobSites = await search(
    ctx,
    TENANT_INDEX.jobSites,
    applyTenantToIndex(TENANT_INDEX.jobSites, schemaName),
    {
      query: address,
    },
  );

  ctx.sendArray(jobSites?.jobSites?.length ? jobSites.jobSites : []);
};

export const deleteJobSite = async ctx => {
  const { id } = ctx.params;

  await JobSiteRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getLinkedCustomers = async ctx => {
  const { jobSiteId } = ctx.params;
  const { skip = 0, limit = LINKED_JOB_SITES_PER_PAGE } = ctx.request.query;
  const { businessUnitId } = ctx.getRequestCondition();
  const condition = { jobSiteId };
  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  const customers = await CustomerRepo.getInstance(ctx.state).getLinkedWithJobSitePaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), LINKED_JOB_SITES_PER_PAGE),
  });

  ctx.sendArray(customers);
};

export const updateDefaultTaxDistricts = async ctx => {
  const { id: jobSiteId } = ctx.params;
  const { taxDistrictIds } = ctx.request.validated.body;

  await JobSiteRepo.getInstance(ctx.state).updateDefaultTaxDistricts({
    jobSiteId,
    taxDistrictIds,
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getAllJobSitesQB = async ctx => {
  const jobSites = await JobSiteRepo.getInstance(ctx.state)
    .getAll({ fields: ['jobSiteId', 'taxDistrictId'] })
    .leftJoin(
      'job_site_default_tax_districts',
      `job_site_default_tax_districts.job_site_id`,
      `${JobSiteRepo.TABLE_NAME}.id`,
    );
  ctx.status = httpStatus.OK;
  ctx.sendObj(jobSites);
};
