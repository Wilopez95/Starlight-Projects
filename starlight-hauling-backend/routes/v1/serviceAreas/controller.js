import httpStatus from 'http-status';
import omit from 'lodash/omit.js';

import ServiceAreaRepo from '../../../repos/serviceArea.js';

import ApiError from '../../../errors/ApiError.js';

export const getServiceAreasPaginated = async ctx => {
  const { skip, limit } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();

  const serviceAreas = await ServiceAreaRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip,
    limit,
  });

  ctx.sendArray(serviceAreas);
};

export const matchedServiceAreas = async ctx => {
  const { jobSiteId, activeOnly = false } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  condition.jobSiteId = jobSiteId;
  if (activeOnly) {
    condition.active = true;
  }

  const serviceAreas = await ServiceAreaRepo.getInstance(ctx.state).matchServiceAreas({
    condition,
  });

  ctx.sendObj(serviceAreas);
};

export const getServiceAreaById = async ctx => {
  const { id } = ctx.params;

  const serviceArea = await ServiceAreaRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(serviceArea);
};

export const getServiceAreaByIds = async ctx => {
  const { schemaName } = ctx.state.user;
  const {
    validated: {
      body: { ids },
    },
  } = ctx.request;

  const serviceAreas = await ServiceAreaRepo.getInstance(schemaName).getAllByIds({
    condition: {},
    ids,
    fields: ['*'],
  });

  ctx.sendArray(serviceAreas);
};

export const createServiceArea = async ctx => {
  const {
    validated: { body: data },
  } = ctx.request;

  const serviceArea = await ServiceAreaRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = serviceArea;
};

export const editServiceArea = async ctx => {
  const { id } = ctx.params;
  const {
    validated: { body: data },
  } = ctx.request;

  const serviceArea = await ServiceAreaRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = serviceArea;
};

export const duplicateServiceArea = async ctx => {
  const { id } = ctx.params;
  const { body } = ctx.request.validated;

  const serviceArea = await ServiceAreaRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });
  if (!serviceArea) {
    throw ApiError.notFound('serviceArea does not exist', `No serviceArea exists with id ${id}`);
  }

  serviceArea.businessLineId = body.businessLineId;

  const duplicatedSA = await ServiceAreaRepo.getInstance(ctx.state).createOne({
    data: omit(serviceArea, ['id', 'name']),
    log: true,
  });

  ctx.sendObj(duplicatedSA);
};

export const deleteServiceArea = async ctx => {
  const { id } = ctx.params;

  await ServiceAreaRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
