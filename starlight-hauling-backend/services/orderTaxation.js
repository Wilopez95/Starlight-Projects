import { mathRound2 } from '../utils/math.js';

import { TAX_APPLICATION, TAX_CALCULATION, TAX_TYPE } from '../consts/taxDistricts.js';
import { WEIGHT_UNIT } from '../consts/workOrder.js';
import { DISTRICT_TYPE } from '../consts/districtTypes.js';
import { REGION } from '../consts/regions.js';
import { logger } from '../utils/logger.js';

const canCalculateWeightTax = (taxes, workOrder) =>
  taxes.application !== TAX_APPLICATION.ton ||
  (workOrder && workOrder.weightUnit === WEIGHT_UNIT.tons && workOrder.weight);

const findConfigurations = (districts, businessLineId) =>
  districts
    ?.map(district => {
      const config = district.businessConfiguration.find(
        taxDistrict => +taxDistrict.businessLineId === +businessLineId,
      );

      return config && { ...district, ...config, id: district.id };
    })
    .filter(Boolean) ?? [];

const findTax = (itemId, subConfig, { exclusions, nonGroup } = {}) => {
  const taxExclusions = exclusions ?? subConfig.exclusions;
  const nonGroupTaxes = nonGroup ?? subConfig.nonGroup;

  if (subConfig.group && taxExclusions.includes(itemId)) {
    return null;
  }

  if (subConfig.group) {
    return {
      value: subConfig.value,
      calculation: subConfig.calculation,
      application: subConfig.application,
    };
  }

  const tax = nonGroupTaxes.find(({ id }) => id === itemId);

  if (!tax) {
    return null;
  }

  return {
    value: tax.value,
    calculation: subConfig.calculation,
    application: subConfig.application,
  };
};

const findTaxOfType = (itemId, type, commercial, district, { workOrder }) => {
  const {
    commercialLineItems,
    commercialMaterials,
    commercialServices,
    nonCommercialLineItems,
    nonCommercialMaterials,
    nonCommercialServices,
  } = district;

  const lineItems = commercial ? commercialLineItems : nonCommercialLineItems;
  const materials = commercial ? commercialMaterials : nonCommercialMaterials;
  const services = commercial ? commercialServices : nonCommercialServices;

  switch (type) {
    case TAX_TYPE.specificLineItem:
      // Per order line item taxes are an annoying special case handled separately.
      return lineItems?.application !== TAX_APPLICATION.order
        ? findTax(itemId, lineItems, {
            exclusions: lineItems.exclusions?.lineItems,
            nonGroup: lineItems.nonGroup?.lineItems,
          })
        : undefined;
    case TAX_TYPE.threshold:
      // Per order line item taxes are an annoying special case handled separately.
      return lineItems?.application !== TAX_APPLICATION.order
        ? findTax(itemId, lineItems, {
            exclusions: lineItems.exclusions?.thresholds,
            nonGroup: lineItems.nonGroup?.thresholds,
          })
        : undefined;
    case TAX_TYPE.material:
      return canCalculateWeightTax(materials, workOrder) ? findTax(itemId, materials) : undefined;
    case TAX_TYPE.service:
      return canCalculateWeightTax(services, workOrder) ? findTax(itemId, services) : undefined;
    default:
      throw new TypeError('Invalid tax type');
  }
};

const calculateTaxOnAmount = (tax, type, amount, quantity = 1, meta) => {
  const result = {
    type,
    amount: 0,
    ...meta,
  };

  const value = Number(tax.value);

  if (tax.calculation === TAX_CALCULATION.percentage) {
    result.amount = mathRound2(value * (amount / 100));
    result.percentageRate = value;
  } else if (tax.application === TAX_APPLICATION.ton) {
    result.amount = mathRound2(quantity * value);
    result.perTonRate = value;
  } else if (tax.application === TAX_APPLICATION.quantity) {
    result.amount = mathRound2(value * quantity);
    result.lineItemPerQuantityRate = Number(quantity);
  } else {
    result.amount = value;
    result.flatRate = true;
  }

  return result;
};

const calculateTaxesForItemUSA = (
  { id, type, amount, quantity, ...meta },
  districts,
  orderData,
  commercial,
) =>
  districts.reduce((taxes, district) => {
    const tax = findTaxOfType(id, type, commercial, district, orderData);

    if (tax) {
      taxes[district.id] = calculateTaxOnAmount(tax, type, amount, quantity, meta);
    }

    return taxes;
  }, {});

const calculateTaxesForItemCA = (
  { id, type, amount, quantity, ...meta },
  districts,
  orderData,
  commercial,
) => {
  let adjustedAmount = amount;

  const primaryDistrict = districts.find(
    district => district.districtType === DISTRICT_TYPE.primary,
  );

  const countryDistrict = districts.find(
    district => district.districtType === DISTRICT_TYPE.country,
  );

  const applyTaxOnTax = primaryDistrict?.includeNationalInTaxableAmount ?? false;

  const taxes = {};

  const countryTax =
    countryDistrict && findTaxOfType(id, type, commercial, countryDistrict, orderData);

  if (countryTax) {
    const calculatedTax = calculateTaxOnAmount(countryTax, type, amount, quantity, meta);

    taxes[countryDistrict.id] = calculatedTax;

    if (applyTaxOnTax) {
      adjustedAmount = mathRound2(amount + calculatedTax.amount);
    }
  }

  districts.forEach(district => {
    if (district.districtType === DISTRICT_TYPE.country) {
      return;
    }

    const tax = findTaxOfType(id, type, commercial, district, orderData);

    if (!tax) {
      return;
    }

    // National tax should be included in province-level tax.
    const taxableAmount = district.districtType === DISTRICT_TYPE.primary ? adjustedAmount : amount;

    const calculatedTax = calculateTaxOnAmount(tax, type, taxableAmount, quantity, meta);

    taxes[district.id] = calculatedTax;
  });

  return taxes;
};

const itemTaxesStrategies = {
  [REGION.usa]: calculateTaxesForItemUSA,
  [REGION.can]: calculateTaxesForItemCA,
};

export const calculateTaxes = ({
  lineItems,
  thresholds,
  taxDistricts,
  billableServiceId,
  materialId,
  workOrder,
  serviceTotal,
  businessLineId,
  region = REGION.usa,
  includeServiceTax = true,
  commercial = true,
}) => {
  // TODO: migrate tenants and make region not nullable.
  // Handle `null` region case.
  const taxesRegion = region ?? REGION.usa;

  const calculateTaxesForItem = itemTaxesStrategies[taxesRegion];

  if (!calculateTaxesForItem) {
    logger.warn(`Unsupported region for taxation: ${taxesRegion}`);
    return { taxesTotal: 0, taxDistrictValues: {} };
  }

  const itemsToTax = [
    ...(lineItems?.map(item => ({
      id: item.billableLineItemId,
      type: TAX_TYPE.specificLineItem,
      amount: mathRound2(item.price * item.quantity),
      quantity: item.quantity,
      lineItemId: item.id,
    })) ?? []),
    ...(thresholds?.map(item => ({
      id: item.thresholdId,
      type: TAX_TYPE.threshold,
      amount: mathRound2(item.price * item.quantity),
      quantity: item.quantity,
      thresholdId: item.id,
    })) ?? []),
  ];

  if (includeServiceTax) {
    if (billableServiceId) {
      itemsToTax.push({
        id: billableServiceId,
        type: TAX_TYPE.service,
        amount: serviceTotal,
        quantity: Number(workOrder?.weight ?? 1),
      });
    }

    if (materialId) {
      itemsToTax.push({
        id: materialId,
        type: TAX_TYPE.material,
        amount: serviceTotal,
        quantity: Number(workOrder?.weight ?? 1),
      });
    }
  }

  const districts = findConfigurations(taxDistricts, businessLineId);
  // Initialize to an object with keys set to district IDs and values set to empty arrays.
  const taxDistrictValues = Object.fromEntries(districts.map(({ id }) => [id, []]));
  const orderData = { workOrder };

  let taxesTotal = 0;

  itemsToTax.forEach(item => {
    const calculations = calculateTaxesForItem(item, districts, orderData, commercial);

    Object.entries(calculations).forEach(([districtId, calculation]) => {
      taxesTotal = mathRound2(taxesTotal + calculation.amount);
      taxDistrictValues[districtId].push(calculation);
    });
  });

  if (lineItems?.length || thresholds?.length) {
    const lineItemIds = itemsToTax
      .filter(({ type }) => type === TAX_TYPE.specificLineItem)
      .map(({ id }) => id);
    const thresholdIds = itemsToTax
      .filter(({ type }) => type === TAX_TYPE.threshold)
      .map(({ id }) => id);

    districts.forEach(({ id, commercialLineItems, nonCommercialLineItems }) => {
      const lineItemsTaxes = commercial ? commercialLineItems : nonCommercialLineItems;

      if (lineItemsTaxes.application !== TAX_APPLICATION.order) {
        return;
      }

      const areAllItemsExcluded =
        lineItemIds.every(itemId => lineItemsTaxes.exclusions.lineItems.includes(itemId)) &&
        thresholdIds.every(itemId => lineItemsTaxes.exclusions.thresholds.includes(itemId));

      if (areAllItemsExcluded) {
        return;
      }

      const amount = Number(lineItemsTaxes.value);

      taxesTotal = mathRound2(taxesTotal + amount);

      taxDistrictValues[id].push({
        amount,
        type: TAX_TYPE.lineItems,
        calculatedPerOrder: true,
        flatRate: true,
      });
    });
  }

  return { taxesTotal: taxesTotal || 0, taxDistrictValues };
};
378;
