import { logger } from '../../utils/logger.js';

import { TAX_APPLICATION, TAX_CALCULATION, TAX_TYPE } from '../../consts/taxDistricts.js';
import { WEIGHT_UNIT } from '../../consts/workOrder.js';
import { DISTRICT_TYPE } from '../../consts/districtTypes.js';
import { REGION } from '../../consts/regions.js';

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

  if (tax) {
    return {
      value: tax.value,
      calculation: subConfig.calculation,
      application: subConfig.application,
    };
  }
  return null;
};

const findTaxOfType = ({ id: itemId, type, commercial, district, orderData: { workOrder } }) => {
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
      return lineItems.application !== TAX_APPLICATION.order
        ? findTax(itemId, lineItems, {
            exclusions: lineItems.exclusions?.lineItems,
            nonGroup: lineItems.nonGroup?.lineItems,
          })
        : undefined;
    case TAX_TYPE.threshold:
      // Per order line item taxes are an annoying special case handled separately.
      return lineItems.application !== TAX_APPLICATION.order
        ? findTax(itemId, lineItems, {
            exclusions: lineItems.exclusions?.thresholds,
            nonGroup: lineItems.nonGroup?.thresholds,
          })
        : undefined;
    case TAX_TYPE.material:
      return canCalculateWeightTax(materials, workOrder) ? findTax(itemId, materials) : undefined;
    case TAX_TYPE.service:
      return canCalculateWeightTax(materials, workOrder) ? findTax(itemId, services) : undefined;
    default:
      throw new TypeError('Invalid tax type');
  }
};

const calculateTaxOnAmount = (tax, type, amount, quantity = 1, meta) => {
  const rate = Number(tax.value) * 1_000_000;
  const result = {
    totalWithSurcharges: amount,
    application: tax.application,
    calculation: tax.calculation,
    type,
    rate,
    quantity,
    amount: 0,
    ...meta,
  };

  if (tax.calculation === TAX_CALCULATION.percentage) {
    result.amount = Math.trunc((rate * amount) / (100 * 1_000_000));
    result.percentageRate = rate;
  } else if (tax.application === TAX_APPLICATION.ton) {
    result.amount = Math.trunc(quantity * rate);
    result.perTonRate = rate;
  } else if (tax.application === TAX_APPLICATION.quantity) {
    result.amount = Math.trunc(rate * quantity);
    result.lineItemPerQuantityRate = Number(quantity);
  } else {
    result.amount = rate;
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
    const tax = findTaxOfType({ id, type, commercial, district, orderData });

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
    countryDistrict &&
    findTaxOfType({ id, type, commercial, district: countryDistrict, orderData });

  if (countryTax) {
    const calculatedTax = calculateTaxOnAmount(countryTax, type, amount, quantity, meta);

    taxes[countryDistrict.id] = calculatedTax;

    if (applyTaxOnTax) {
      adjustedAmount = Math.trunc(amount + calculatedTax.amount);
    }
  }

  districts.forEach(district => {
    if (district.districtType === DISTRICT_TYPE.country) {
      return;
    }

    const tax = findTaxOfType({ id, type, commercial, district, orderData });

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
  includingSurcharges,
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
      billableLineItemId: item.billableLineItemId,
      type: TAX_TYPE.specificLineItem,
      amount: item.totalWithSurcharges,
      quantity: item.quantity,
      lineItemId: item.id,
      includingSurcharges: item.includingSurcharges,
    })) ?? []),
    ...(thresholds?.map(item => ({
      id: item.thresholdId,
      thresholdId: item.thresholdId,
      type: TAX_TYPE.threshold,
      amount: item.totalWithSurcharges,
      quantity: item.quantity,
      thresholdItemId: item.id,
      includingSurcharges: item.includingSurcharges,
    })) ?? []),
  ];

  if (includeServiceTax) {
    if (billableServiceId) {
      itemsToTax.push({
        id: billableServiceId,
        type: TAX_TYPE.service,
        amount: serviceTotal,
        quantity: Number(workOrder?.weight ?? 1),
        includingSurcharges,
        billableServiceId,
      });
    }

    if (materialId) {
      itemsToTax.push({
        id: materialId,
        type: TAX_TYPE.material,
        amount: serviceTotal,
        quantity: Number(workOrder?.weight ?? 1),
        includingSurcharges,
        materialId,
      });
    }
  }

  const districts = findConfigurations(taxDistricts, businessLineId);
  // Initialize to an object with keys set to district IDs and values set to empty arrays.
  const taxDistrictValues = Object.fromEntries(
    districts.map(({ id, districtName, districtType, description, updatedAt }) => [
      id,
      {
        name: districtName,
        type: districtType,
        description,
        updatedAt,
        values: [],
      },
    ]),
  );
  const orderData = { workOrder };

  let taxesTotal = 0;

  itemsToTax.forEach(item => {
    const calculations = calculateTaxesForItem(item, districts, orderData, commercial);

    Object.entries(calculations).forEach(([districtId, calculation]) => {
      taxesTotal = Math.trunc(taxesTotal + calculation.amount);
      taxDistrictValues[districtId].values.push(calculation);
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

      const amount = Number(lineItemsTaxes.value) * 1_000_000;

      taxesTotal = Math.trunc(taxesTotal + amount);

      taxDistrictValues[id].values.push({
        application: lineItemsTaxes.application,
        calculation: TAX_CALCULATION.flat,
        rate: amount,
        type: TAX_TYPE.lineItems,
        calculatedPerOrder: true,
        flatRate: true,
        amount,
      });
    });
  }

  return { taxesTotal: taxesTotal || 0, taxDistrictValues };
};
