import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';

import DisposalSiteRepo from '../../../repos/disposalSite.js';
import MaterialCodeRepo from '../../../repos/materialCode.js';
import DisposalSiteRateRepo from '../../../repos/disposalSiteRate.js';
import MaterialsRepo from '../../../repos/material.js';

export const getDisposalSiteById = async ctx => {
  const { id } = ctx.params;

  const site = await DisposalSiteRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(site);
};

export const getDisposalSites = async ctx => {
  const condition = {};
  if (ctx.request.query.activeOnly) {
    condition.active = true;
  }
  if (ctx.request.query.description) {
    condition.description = ctx.request.query.description;
  }

  const sites = await DisposalSiteRepo.getInstance(ctx.state).getAll({ condition });

  ctx.sendArray(sites);
};

export const createDisposalSite = async ctx => {
  const data = ctx.request.validated.body;
  delete data.address.region;
  Object.assign(data, { coordinates: data.location.coordinates }, data.address);
  delete data.address;

  const newSite = await DisposalSiteRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newSite;
};

export const editDisposalSite = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const data = ctx.request.validated.body;
  delete data.address.region;
  Object.assign(data, { coordinates: data.location.coordinates }, data.address);
  delete data.address;

  const updatedSite = await DisposalSiteRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = updatedSite;
};

export const deleteDisposalSite = async ctx => {
  const { id } = ctx.params;

  await DisposalSiteRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getRecyclingCodes = async ctx => {
  const { schemaName } = ctx.state.user;
  const { recyclingTenantName, businessUnitId } = ctx.request.validated.query;

  const materials = await MaterialsRepo.getInstance(ctx.state, {
    schemaName: recyclingTenantName ?? schemaName,
  }).getAllWithCodes({
    businessUnitId,
  });

  ctx.sendObj({
    data: {
      materials: {
        data: materials?.map(pick(['id', 'description', 'active', 'code'])) ?? [],
        total: materials?.length || 0,
      },
    },
  });
};

export const getMaterialCodes = async ctx => {
  const { id: disposalSiteId } = ctx.params;
  const { businessLineId, materialId } = ctx.request.validated.query;

  const condition = { disposalSiteId, businessLineId };
  materialId && (condition.materialId = materialId);

  const materialCodes = await MaterialCodeRepo.getInstance(ctx.state).getAllPopulated({
    condition,
  });

  ctx.sendArray(materialCodes);
};

export const getDisposalRates = async ctx => {
  const { id: disposalSiteId } = ctx.params;
  const { businessLineId } = ctx.request.validated.query;

  const disposalRates = await DisposalSiteRateRepo.getInstance(ctx.state).getAllPopulated({
    condition: { disposalSiteId, businessLineId },
  });

  ctx.sendArray(disposalRates);
};

export const mapMaterialCodes = async ctx => {
  const { id } = ctx.params;
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  if (data?.length) {
    data.forEach(item => (item.disposalSiteId = id));

    await MaterialCodeRepo.getInstance(ctx.state).upsertMany({
      data,
      concurrentData,
      log: true,
    });
  }

  ctx.status = httpStatus.OK;
};

export const updateDisposalRates = async ctx => {
  const { id } = ctx.params;
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  if (data?.length) {
    data.forEach(item => (item.disposalSiteId = id));
    await DisposalSiteRateRepo.getInstance(ctx.state).upsertMany({
      data,
      concurrentData,
      log: true,
    });
  }

  ctx.status = httpStatus.OK;
};
