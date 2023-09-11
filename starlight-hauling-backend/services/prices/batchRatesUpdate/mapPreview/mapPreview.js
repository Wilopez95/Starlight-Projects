import uniq from 'lodash/uniq.js';
import PriceGroupsRepository from '../../../../repos/priceGroups.js';

const mapPreview = async (ctxState, prices, { PriceGroupsRepo = PriceGroupsRepository }) => {
  if (!prices.length) {
    return [];
  }

  const priceGroups = await PriceGroupsRepo.getInstance(ctxState).getAllByIds({
    ids: uniq(prices.map(({ priceGroupId }) => priceGroupId)),
    fields: ['id'],
    joinedFields: ['customerId', 'customerJobSiteId', 'customerGroupId', 'serviceAreasIds'],
    isPreview: true,
  });

  const priceGroupMap = priceGroups.reduce((acc, { id, ...group }) => {
    acc[id] = group;
    return acc;
  }, {});

  const previewPrices = prices.map(item => ({
    ...item,
    ...priceGroupMap[item.priceGroupId],
    price: Number(item.price),
  }));

  return previewPrices;
};

export default mapPreview;
