import uniq from 'lodash/uniq.js';

const getBillableServiceIds = serviceItems =>
  uniq(serviceItems.map(({ billableServiceId }) => billableServiceId));

const getBillableServiceInclusions = async (
  ctx,
  { serviceItems },
  { BillableServiceInclusionRepo },
) => {
  console.log(
    '🚀 aa2 ~ file: getBillableServiceInclusion.js:12 ~  ~ starting timer for getHistoricalInstance:🚀',
  );
  const start = Date.now();
  const includedServices =
    (await BillableServiceInclusionRepo.getHistoricalInstance(
      ctx.state,
    ).getIncludedServicesByServiceIdBulk({
      billableServiceIds: getBillableServiceIds(serviceItems),
    })) ?? [];

  const timeTaken = Date.now() - start;
  console.log(
    '🚀 aa2 ~ file: getBillableServiceInclusion.js:24 ~  ~ getHistoricalInstance:🚀',
    timeTaken,
  );

  return includedServices.reduce((acc, { billableServiceId, services }) => {
    acc[billableServiceId] = services;
    return acc;
  }, {});
};

export default getBillableServiceInclusions;
