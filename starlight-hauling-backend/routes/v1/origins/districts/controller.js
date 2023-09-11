import OriginDistrictRepository from '../../../../repos/originDistrict.js';
import { SORT_ORDER } from '../../../../consts/sortOrders.js';

export const getOriginDistrictById = async ctx => {
  const { id } = ctx.params;

  const origin = await OriginDistrictRepository.getHistoricalInstance(ctx.state).getById({ id });
  ctx.sendArray(origin);
};

export const getAllDistricts = async ctx => {
  const { activeOrigins = false, sortOrder = SORT_ORDER.desc, sortBy } = ctx.request.query;

  const condition = {
    filters: { filterByBusinessUnits: ctx.request.validated.query.filterByBusinessUnits },
  };

  if (activeOrigins) {
    condition.activeOrigins = true;
  }
  const districts = await OriginDistrictRepository.getInstance(ctx.state).getAllBy({
    sortOrder,
    sortBy,
    condition,
  });

  ctx.sendArray(districts);
};
