import omit from 'lodash/omit.js';
import pick from 'lodash/pick.js';
import find from 'lodash/find.js';
import cloneDeep from 'lodash/cloneDeep.js';
import { DISTRICT_TYPE } from '../../../../consts/districtTypes.js';
import { TAX_KIND } from '../../../../consts/taxDistricts.js';
import getItemAppliedTaxes from '../../common/getItemAppliedTaxes.js';
import groupTaxesCalculationsByDistricts from '../../common/groupTaxesCalculationsByDistricts.js';
import { getTaxesTotal } from '../common/getTotals.js';

const districtTypeSortOrder = {
  [DISTRICT_TYPE.primary]: 0,
  [DISTRICT_TYPE.municipal]: 1,
  [DISTRICT_TYPE.secondary]: 2,
};

const getTaxesInfo = async (
  ctx,
  { jobSiteId, businessLineId, customerId, subscriptionOrder },
  { JobSiteRepo, CustomerRepo },
) => {
  let taxDistricts;
  let subscriptionOrderAppliedTaxes;
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
    subscriptionOrderAppliedTaxes = cloneDeep(subscriptionOrder);
    subscriptionOrderAppliedTaxes.appliedTaxes = getItemAppliedTaxes({
      taxKind: TAX_KIND.services,
      billableItemId: subscriptionOrder.billableServiceId,
      materialId: subscriptionOrder.materialId,
      item: subscriptionOrder,
      appliedForSubscription,
      taxDistricts,
      customerType,
    });

    subscriptionOrderAppliedTaxes.lineItems = subscriptionOrderAppliedTaxes.lineItems.map(
      lineItem => {
        lineItem.appliedTaxes = getItemAppliedTaxes({
          taxKind: TAX_KIND.lineItems,
          billableItemId: lineItem.billableLineItemId,
          materialId: lineItem.materialId,
          item: lineItem,
          appliedForSubscription,
          taxDistricts,
          customerType,
        });

        return pick(lineItem, ['billableLineItemId', 'appliedTaxes']);
      },
    );

    subscriptionOrderAppliedTaxes = pick(subscriptionOrderAppliedTaxes, [
      'billableServiceId',
      'appliedTaxes',
      'lineItems',
    ]);
  }

  return {
    taxesTotal: getTaxesTotal([subscriptionOrderAppliedTaxes]),
    taxCalculations: groupTaxesCalculationsByDistricts([subscriptionOrderAppliedTaxes]),
    taxDistrictNames,
  };
};

export default getTaxesInfo;
