import httpStatus from 'http-status';

import ApiError from '../../../errors/ApiError.js';

import BusinessLineRepo from '../../../repos/businessLine.js';
import BussnessUnitLineRepo from '../../../repos/businessUnitLine.js';

import * as billingService from '../../../services/billing.js';

import {
  DEFAULT_BUSINESS_LINES_SEED_DATA,
  BUSINESS_LINE_TYPE,
} from '../../../consts/businessLineTypes.js';

import { CRPT_FEATURES_OFF } from '../../../config.js';

export const syncLineOfBusiness = async (ctx, { data, schemaName }) => {
  await billingService.upsertLineOfBusiness(ctx, { data, schemaName });
};

export const getBusinessLines = async ctx => {
  const { businessUnitId, activeOnly } = ctx.request.validated.query;
  const condition = {};
  if (activeOnly) {
    condition.active = true;
  }
  if (businessUnitId) {
    condition.businessUnitId = businessUnitId;
  }

  let businessLines = await BusinessLineRepo.getInstance(ctx.state).getAll({
    condition,
  });

  // TODO: remove this when old data wiped out
  if (businessLines?.length && CRPT_FEATURES_OFF) {
    businessLines = businessLines.filter(lob =>
      [BUSINESS_LINE_TYPE.rollOff, BUSINESS_LINE_TYPE.recycling].includes(lob.type),
    );
  }

  ctx.sendArray(businessLines);
};

export const getDefaultBusinessLines = ctx => ctx.sendArray(DEFAULT_BUSINESS_LINES_SEED_DATA);

export const createBusinessLine = async ctx => {
  const newBusinessLine = await BusinessLineRepo.getInstance(ctx.state).createOne({
    data: ctx.request.validated.body,
    log: true,
  });

  const { schemaName } = ctx.state.user;
  await syncLineOfBusiness(ctx, { data: [newBusinessLine], schemaName });

  ctx.status = httpStatus.CREATED;
  ctx.body = newBusinessLine;
};

export const editBusinessLine = async ctx => {
  const { id } = ctx.params;
  const { active } = ctx.request.validated.body;
  let hasBusinessUnitLinesRecords = false;

  const repo = BusinessLineRepo.getInstance(ctx.state);
  if (!active) {
    hasBusinessUnitLinesRecords = await BussnessUnitLineRepo.getInstance(ctx.state).count({
      condition: { businessLineId: id },
    });
  }

  if (hasBusinessUnitLinesRecords) {
    throw ApiError.invalidRequest(
      'LoB has relation with BU',
      'Cant be deactivated. There are BUs connected to this LoB',
    );
  }

  const updatedBusinessLine = await repo.updateBy({
    condition: { id },
    data: ctx.request.validated.body,
    log: true,
  });

  const { schemaName } = ctx.state.user;
  await syncLineOfBusiness(ctx, { data: [updatedBusinessLine], schemaName });

  ctx.status = httpStatus.OK;
  ctx.body = updatedBusinessLine;
};

export const deleteBusinessLine = async ctx => {
  const { id } = ctx.params;

  await BusinessLineRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
