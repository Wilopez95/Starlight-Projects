import setProperty from 'lodash/set.js';
import find from 'lodash/find.js';
import isNil from 'lodash/isNil.js';
import { TAX_APPLICATION, TAX_CALCULATION, TAX_KIND } from '../../../consts/taxDistricts.js';
import { CUSTOMER_GROUP_TYPE } from '../../../consts/customerGroups.js';

const taxKindBillableItemMap = {
  [TAX_KIND.recurringServices]: 'billableServiceId',
  [TAX_KIND.recurringLineItems]: 'billableLineItemId',
  [TAX_KIND.services]: 'billableServiceId',
  [TAX_KIND.lineItems]: 'billableLineItemId',
  [TAX_KIND.materials]: 'materialId',
};

const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

const calculateMaterialTaxFor = [TAX_KIND.recurringServices, TAX_KIND.services];

const getAppliedTaxes = ({
  taxDistrict,
  taxKind,
  billableItemId,
  materialId,
  item,
  appliedForSubscription,
  customerType,
}) => {
  const { districtName, taxConfigs, id: taxDistrictId } = taxDistrict;
  const taxType = customerType === CUSTOMER_GROUP_TYPE.commercial ? 'commercial' : 'nonCommercial';

  const { application, calculation, group, value, nonGroup } =
    taxConfigs[`${taxType}${capitalizeFirstLetter(taxKind)}`];

  const taxableItemId = taxKind === TAX_KIND.materials ? materialId : billableItemId;

  const taxValue = group
    ? value
    : find(nonGroup, {
        id: taxableItemId,
      })?.value;
  const { quantity } = item;

  const appliedTax = {
    [taxKindBillableItemMap[taxKind]]: taxableItemId,
    value: Number(taxValue) || 0,
    districtName,
    application,
    calculation,
    quantity,
  };

  const hasProratedTotal = !isNil(item.proratedTotal);
  const totalPrice = hasProratedTotal ? item.proratedTotal : item.totalPrice;

  if (hasProratedTotal) {
    appliedTax.proratedTotal = totalPrice;
  } else {
    appliedTax.totalPrice = totalPrice;
  }

  switch (calculation) {
    case TAX_CALCULATION.percentage: {
      appliedTax.calculatedTax = (totalPrice * appliedTax.value) / 100;
      break;
    }
    case TAX_CALCULATION.flat: {
      switch (application) {
        case TAX_APPLICATION.subscription: {
          if (appliedForSubscription?.[taxDistrictId]?.[taxKind]?.[billableItemId]) {
            appliedTax.calculatedTax = 0;
            break;
          }

          appliedTax.calculatedTax = appliedTax.value;
          setProperty(
            appliedForSubscription,
            `${taxDistrictId}.${taxKind}.${billableItemId}`,
            true,
          );
          break;
        }
        case TAX_APPLICATION.order:
        case TAX_APPLICATION.each: {
          appliedTax.calculatedTax = appliedTax.value;
          appliedTax.application = TAX_APPLICATION.each;
          break;
        }
        case TAX_APPLICATION.quantity: {
          appliedTax.calculatedTax = quantity * appliedTax.value;
          break;
        }
        default: {
          appliedTax.calculatedTax = 0;
        }
      }
      break;
    }
    default: {
      appliedTax.calculatedTax = 0;
    }
  }

  return appliedTax;
};

const getItemAppliedTaxes = ({
  taxDistricts = [],
  taxKind,
  billableItemId,
  materialId = null,
  item,
  appliedForSubscription,
  customerType,
}) =>
  taxDistricts.map(taxDistrict => {
    const appliedTaxes = [
      getAppliedTaxes({
        materialId: null,
        taxDistrict,
        taxKind,
        billableItemId,
        item,
        appliedForSubscription,
        customerType,
      }),
    ];

    if (calculateMaterialTaxFor.includes(taxKind) && materialId) {
      appliedTaxes.push(
        getAppliedTaxes({
          taxKind: TAX_KIND.materials,
          taxDistrict,
          billableItemId,
          materialId,
          item,
          appliedForSubscription,
          customerType,
        }),
      );
    }

    return appliedTaxes.filter(({ calculatedTax }) => !(calculatedTax === 0));
  });

export default getItemAppliedTaxes;
