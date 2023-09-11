import httpStatus from 'http-status';

import MaterialProfileRepo from '../../../repos/materialProfile.js';

export const getMaterialProfileById = async ctx => {
  const { id } = ctx.params;

  const profile = await MaterialProfileRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(profile);
};

export const getMaterialProfiles = async ctx => {
  const { activeOnly, materials, disposals } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  if (activeOnly) {
    condition.active = true;
  }

  const populate = materials || disposals;
  const profiles = await MaterialProfileRepo.getInstance(ctx.state)[
    populate ? 'getAllPopulated' : 'getAll'
  ]({
    condition,
    materials,
    disposals,
  });

  ctx.sendArray(profiles);
};

export const createMaterialProfile = async ctx => {
  const data = ctx.request.validated.body;

  const newProfile = await MaterialProfileRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newProfile;
};

export const editMaterialProfile = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedProfile = await MaterialProfileRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.sendObj(updatedProfile);
};

export const deleteMaterialProfile = async ctx => {
  const { id } = ctx.params;

  await MaterialProfileRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
