import cloneDeep from 'lodash/cloneDeep.js';
import omit from 'lodash/omit.js';

const groupProrationPeriodsByServiceItem = (prorationPeriods = []) => {
  const serviceItemsLength = prorationPeriods[0]?.length;
  const flattened = prorationPeriods.flat();
  const groupedByServiceItem = [];

  flattened.forEach((serviceItem, idx) => {
    const serviceItemGroupIdx = idx % serviceItemsLength;
    groupedByServiceItem[serviceItemGroupIdx] = groupedByServiceItem[serviceItemGroupIdx] ?? [];
    groupedByServiceItem[serviceItemGroupIdx].push(serviceItem);
  });

  return groupedByServiceItem;
};

const mergeItemProrationInfo = (target = {}, source = {}) => {
  const clonedTarget = cloneDeep(target);
  clonedTarget.proratedTotal = (clonedTarget?.proratedTotal ?? 0) + (source?.proratedTotal ?? 0);
  clonedTarget.usageDay = (clonedTarget?.usageDay ?? 0) + (source?.usageDay ?? 0);

  return omit(clonedTarget, ['periodFrom', 'periodTo', 'subscriptionOrdersTotal']);
};

const mergeServiceItemProrationPeriods = (serviceItems = []) =>
  serviceItems.reduce((mergedProrationPeriods, prorationPeriod) => {
    const clonedProrationPeriod = cloneDeep(prorationPeriod);
    clonedProrationPeriod.serviceItemProrationInfo = mergeItemProrationInfo(
      clonedProrationPeriod.serviceItemProrationInfo,
      mergedProrationPeriods.serviceItemProrationInfo,
    );

    clonedProrationPeriod.lineItemsProrationInfo = clonedProrationPeriod.lineItemsProrationInfo.map(
      (lineItemProrationInfo, idx) =>
        mergeItemProrationInfo(
          lineItemProrationInfo,
          mergedProrationPeriods?.lineItemsProrationInfo?.[idx],
        ),
    );

    return omit(clonedProrationPeriod, ['periodFrom', 'periodTo']);
  }, {});

const getServiceItemsByBillingPeriods = billingPeriods => {
  return cloneDeep(billingPeriods).map(prorationPeriods =>
    groupProrationPeriodsByServiceItem(prorationPeriods).map(mergeServiceItemProrationPeriods),
  );
};
export default getServiceItemsByBillingPeriods;
