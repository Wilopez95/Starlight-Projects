import omit from 'lodash/omit.js';
import pick from 'lodash/pick.js';
import find from 'lodash/find.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { DISTRICT_TYPE } from '../../../../consts/districtTypes.js';
import { TAX_KIND } from '../../../../consts/taxDistricts.js';
import getItemAppliedTaxes from '../../common/getItemAppliedTaxes.js';
import groupTaxesCalculationsByDistricts from '../../common/groupTaxesCalculationsByDistricts.js';
import getTaxesTotal from '../common/getTaxesTotal.js';
import getRecurringTaxesTotal from '../common/getRecurringTaxesTotal.js';

const districtTypeSortOrder = {
  [DISTRICT_TYPE.primary]: 0,
  [DISTRICT_TYPE.municipal]: 1,
  [DISTRICT_TYPE.secondary]: 2,
};

const getTaxesInfo = async (
  ctx,
  { jobSiteId, businessLineId, customerId, serviceItems },
  { JobSiteRepo, CustomerRepo },
) => {
  let taxDistricts;
  let serviceItemsAppliedTaxes;
  let taxDistrictNames;

  const customerGroup = await CustomerRepo.getInstance(ctx.state).getGroupByCustomerId(customerId);
  const customerType = customerGroup?.type;

  if (jobSiteId) {
    taxDistricts = (
      await JobSiteRepo.getInstance(ctx.state).getDefaultTaxDistricts({
        activeOnly: true,
        jobSiteId,
      })
    )
      .map(taxDistrict => {
        taxDistrict.districtOrder = districtTypeSortOrder[taxDistrict.districtType];
        taxDistrict.taxConfigs = find(taxDistrict.businessConfiguration, {
          businessLineId,
        });
        return taxDistrict;
      })
      .sort((left, right) => left.districtOrder - right.districtOrder)
      .map(taxDistrict =>
        omit(taxDistrict, [
          'bbox',
          'businessLineTaxesIds',
          'businessConfiguration',
          'districtOrder',
        ]),
      );

    taxDistrictNames = taxDistricts.map(({ districtName }) => districtName);
    const appliedForSubscription = {};
    serviceItemsAppliedTaxes = cloneDeep(serviceItems)
      .map(serviceItem => {
        const {
          billableServiceId,
          serviceItemProrationInfo,
          lineItemsProrationInfo,
          subscriptionOrders,
        } = serviceItem;
        const appliedInfo = {
          taxKind: TAX_KIND.recurringServices,
          billableItemId: billableServiceId,
          materialId: serviceItemProrationInfo?.materialId,
          appliedForSubscription,
          taxDistricts,
          customerType,
        };

        serviceItem.appliedTaxes = getItemAppliedTaxes({
          ...appliedInfo,
          item: serviceItemProrationInfo,
        });

        serviceItem.lineItems = lineItemsProrationInfo.map(lineItemProrationInfo => {
          lineItemProrationInfo.appliedTaxes = getItemAppliedTaxes({
            ...appliedInfo,
            item: lineItemProrationInfo,
          });

          return pick(lineItemProrationInfo, ['billableLineItemId', 'appliedTaxes']);
        });

        serviceItem.subscriptionOrders = subscriptionOrders.map(subscriptionOrder => {
          subscriptionOrder.appliedTaxes = getItemAppliedTaxes({
            ...appliedInfo,
            item: subscriptionOrder,
          });

          return pick(subscriptionOrder, ['billableServiceId', 'appliedTaxes']);
        });

        return serviceItem;
      })
      .map(serviceItem =>
        pick(serviceItem, ['billableServiceId', 'appliedTaxes', 'lineItems', 'subscriptionOrders']),
      );
  }

  return {
    taxesTotal: getTaxesTotal(serviceItemsAppliedTaxes),
    recurringTaxesTotal: getRecurringTaxesTotal(serviceItemsAppliedTaxes),
    taxCalculations: groupTaxesCalculationsByDistricts(serviceItemsAppliedTaxes),
    taxDistrictNames,
  };
};

export default getTaxesInfo;
