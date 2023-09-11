import {
  GetTaxDistrictsForOrderQuery,
  LineItemTax,
  OrderBillableItem,
  Tax,
  TaxApplication,
  TaxBusinessConfiguration,
  TaxCalculation,
  TaxDistrictType,
} from '../../../../../graphql/api';
import { Region } from '../../../../../i18n/region';
import { TFunction } from 'i18next';
import { mathRound2 } from '../../../../../utils/mathRound';

/**
 * copied from
 * https://github.com/Starlightpro/starlight-hauling-frontend/blob/development/src/components/modals/TaxesCalculation/helpers.ts
 * https://github.com/Starlightpro/starlight-hauling-frontend/blob/development/src/helpers/calcTaxes.ts
 * with small changes
 * */

export type FormattedTax = {
  description: string;
  amount: number;
  basedOn?: string;
  calculation: string;
  hasAppliedSurcharges?: boolean;
};

export interface FormattableLineItem {
  uuid: string;
  description: string;
  quantity: number;
  isThreshold: boolean;
  price?: number;
  thresholdId?: number;
  billableLineItemId?: number;
  applySurcharges?: boolean;
}

type TaxDistrict = GetTaxDistrictsForOrderQuery['taxDistrictsForOrder'][number];

export const shouldIncludeTax = (tax: FormattedTax | null): tax is FormattedTax =>
  tax !== null && tax.amount > 0.009;

export const formatServiceOrMaterialTax = ({
  taxDistrict,
  serviceTotal,
  itemCategory,
  businessLineId,
  itemId,
  itemName,
  quantity,
  hasAppliedSurcharges,
  commercialTaxesUsed,
  netWeight,
  t,
}: {
  taxDistrict: TaxDistrict;
  serviceTotal: number;
  itemCategory: 'materials' | 'services';
  businessLineId: number | string;
  quantity: number;
  commercialTaxesUsed: boolean;
  itemId?: number | null;
  itemName?: string;
  hasAppliedSurcharges?: boolean;
  netWeight: number;
  t: TFunction;
}): FormattedTax | null => {
  if (!itemId) {
    return null;
  }

  const taxesConfiguration = findTaxConfigurationByBusinessLineId(taxDistrict, businessLineId);

  if (!taxesConfiguration) {
    return null;
  }

  let tax: Tax;

  if (itemCategory === 'materials') {
    tax =
      taxesConfiguration[commercialTaxesUsed ? 'commercialMaterials' : 'nonCommercialMaterials'];
  } else {
    tax = taxesConfiguration[commercialTaxesUsed ? 'commercialServices' : 'nonCommercialServices'];
  }

  let formattedValue: string;
  let application: string;
  let on: string;
  let calculation: string;
  let taxType: string;
  let amount: number;
  let basedOn: string | undefined;

  const nonGroupTax = !tax.group && tax.nonGroup?.find(({ id }) => id === itemId);

  if ((tax.group && tax.exclusions?.includes(itemId)) || (!tax.group && !nonGroupTax)) {
    return null;
  }

  const value = (nonGroupTax as { value: string } | undefined)?.value ?? tax.value;

  if (tax.calculation === TaxCalculation.Flat) {
    formattedValue = t('money', { value });
    taxType = t('flat tax');

    if (tax.application === TaxApplication.Order) {
      application = t('per order');
      amount = Number(value) * quantity;
      calculation = `${t('money', { value })} * ${quantity} = ${t('money', { value: amount })}`;
      basedOn = quantity.toString();
    } else {
      application = t('per ton');
      // `quantity` can only be 1 in this case
      amount = Number(value) * netWeight;
      calculation = `${t('money', { value })} * ${quantity} = ${t('money', { value: amount })}`;
      basedOn = `${netWeight} ${t('tons')}`;
    }
  } else {
    application = t('per order');
    amount = mathRound2((Number(value) / 100) * (serviceTotal * quantity));
    basedOn = `${mathRound2(serviceTotal)}`;
    taxType = t('tax');
    formattedValue = `${value}%`;
    calculation = `${t('money', { value: serviceTotal })} * ${quantity} * ${value}% = ${t('money', {
      value: amount,
    })}`;
  }

  if (tax.group) {
    on = `${t('on all')} ${itemCategory}`;
  } else {
    on = `${t('on')} ${itemName}`;
  }

  return {
    description: `${formattedValue} ${taxType} ${application} ${on}`,
    calculation,
    amount,
    basedOn,
    hasAppliedSurcharges,
  };
};

export const formatLineItemsTaxes = ({
  taxDistrict,
  businessLineId,
  lineItems,
  quantity,
  commercialTaxesUsed,
  t,
}: {
  taxDistrict: TaxDistrict;
  businessLineId: number | string;
  quantity: number;
  lineItems: FormattableLineItem[];
  commercialTaxesUsed: boolean;
  t: TFunction;
}): (FormattedTax & {
  lineItem: FormattableLineItem;
  shouldDisplayLineItem?: boolean;
})[] => {
  if (lineItems.length === 0) {
    return [];
  }

  const taxesConfiguration = findTaxConfigurationByBusinessLineId(taxDistrict, businessLineId);

  if (!taxesConfiguration) {
    return [];
  }
  const tax =
    taxesConfiguration[commercialTaxesUsed ? 'commercialLineItems' : 'nonCommercialLineItems'];

  if (tax.application === TaxApplication.Order) {
    const taxType = t('flat tax');
    const value = Number(tax.value as string);
    const amount = Number(tax.value as string) * quantity;
    const calculation = `${t('money', { value: value })} * ${quantity} = ${t('money', {
      value: amount,
    })}`;

    return [
      {
        description: `${t('money', { value })} ${taxType} ${t('per order on all line items')}`,
        amount,
        calculation,
        lineItem: lineItems[0],
        shouldDisplayLineItem: false,
      },
    ];
  }

  let application: string;

  if (tax.application === TaxApplication.Each) {
    application = t('per item');
  } else {
    application = t('per quantity');
  }

  const result: (FormattedTax & {
    lineItem: FormattableLineItem;
    shouldDisplayLineItem: true;
  })[] = [];

  lineItems?.forEach((lineItem) => {
    const isThreshold = lineItem.isThreshold;

    const nonGroupTax =
      !tax.group &&
      (isThreshold
        ? tax.nonGroup?.thresholds.find(({ id }) => id === lineItem.thresholdId)
        : tax.nonGroup?.lineItems.find(({ id }) => id === lineItem.billableLineItemId));

    const hasThreshold =
      isThreshold && tax.exclusions?.thresholds.includes(lineItem.thresholdId as number);
    const hasLineItem =
      !isThreshold && tax.exclusions?.lineItems.includes(lineItem.billableLineItemId as number);
    const isExcluded = tax.group && (hasThreshold || hasLineItem);

    if (isExcluded || (!tax.group && !nonGroupTax)) {
      return;
    }

    const value = (nonGroupTax as { value: string } | undefined)?.value ?? tax.value;
    let calculation: string;
    let amount: number;
    let basedOn: string | undefined;
    let description: string;
    let formattedValue: string;

    const on = tax.group
      ? t('on all line items and thresholds')
      : `${t('on')} ${lineItem.description}`;

    if (tax.calculation === TaxCalculation.Percentage) {
      formattedValue = `${value}%`;
      description = `${formattedValue} ${on}`;
      amount = mathRound2(
        (Number(value) / 100) *
          (Number(lineItem?.price) || 0) *
          (Number(lineItem?.quantity) || 0) *
          quantity,
      );
      calculation = `${formattedValue} * ${lineItem?.quantity} * ${quantity} * ${
        lineItem.price
      } = ${t('money', { value: amount })}`;
      basedOn = `${Number(lineItem?.quantity) || 0}`;
    } else {
      formattedValue = t('money', { value: Number(value) });

      if (tax.application === TaxApplication.Each) {
        amount = Number(value) * quantity;
        calculation = `${formattedValue} * ${quantity} = ${t('money', {
          value: amount,
        })}`;
        basedOn = quantity.toString();
      } else {
        amount = Number(value) * lineItem.quantity * quantity;
        calculation = `${formattedValue} * ${lineItem.quantity} * ${quantity} = ${t('money', {
          value: amount,
        })}`;
        basedOn = lineItem.quantity.toString();
      }

      description = `${formattedValue} ${t('flat tax')} ${application} ${on}`;
    }

    result.push({
      description,
      calculation,
      amount,
      basedOn,
      lineItem,
      shouldDisplayLineItem: true,
    });
  });

  return result;
};

export interface CalcOrderTaxesInput {
  commercialTaxesUsed: boolean;
  service?: {
    billableServiceId: number;
    materialId?: number;
  };
  serviceTotal: number;
  lineItems: OrderBillableItem[];
  thresholds: OrderBillableItem[];
  taxDistricts: TaxDistrict[];
  businessLineId: string | number;
  region: Region;
  netWeight: number;
}

enum TaxType {
  LineItem,
  Threshold,
  Service,
  Material,
}

interface TaxableItem {
  id: number;
  type: TaxType;
  amount: number;
  quantity: number;
}

type ResolvedDistricts = (TaxDistrict & TaxBusinessConfiguration)[];

export const findTaxConfigurationByBusinessLineId = (
  taxDistrict: TaxDistrict,
  businessLineId: number | string,
) => {
  return taxDistrict.businessConfiguration?.find(
    (ditrict) => +ditrict.businessLineId === +businessLineId,
  );
};

export const checkIfMaterialTaxable = (
  businessLineId: number | string,
  materialId: number,
  taxDistrict: TaxDistrict,
  commercialTaxesUsed: boolean,
) => {
  const configuration = findTaxConfigurationByBusinessLineId(taxDistrict, businessLineId);

  if (configuration) {
    const tax =
      configuration[commercialTaxesUsed ? 'commercialMaterials' : 'nonCommercialMaterials'];

    const nonGroupTax = !tax.group && tax.nonGroup?.find(({ id }) => id === materialId);

    if ((tax.group && tax.exclusions?.includes(materialId)) || (!tax.group && !nonGroupTax)) {
      return false;
    }

    const value = Number((nonGroupTax as { value: string } | undefined)?.value ?? tax.value);

    if (!Number.isNaN(value) && value > 0) {
      return true;
    }
  }

  return false;
};

const findConfigurations = (districts: TaxDistrict[], businessLineId: number | string) =>
  districts.reduce<ResolvedDistricts>((result, district) => {
    const config = district.businessConfiguration?.find(
      (taxDistrict) => +taxDistrict.businessLineId === +businessLineId,
    );

    if (config) {
      result.push({ ...district, ...config, id: district.id } as any);
    }

    return result;
  }, []);

const findTax = (
  itemId: number,
  subConfig: Tax | LineItemTax,
  { exclusions, nonGroup }: Pick<Tax, 'exclusions' | 'nonGroup'> = { exclusions: [] },
) => {
  const taxExclusions = exclusions ?? (subConfig as Tax).exclusions;
  const nonGroupTaxes = nonGroup ?? (subConfig as Tax).nonGroup;

  if (subConfig.group && taxExclusions?.includes(itemId)) {
    return;
  }

  if (subConfig.group) {
    return {
      value: subConfig.value,
      calculation: subConfig.calculation,
      application: subConfig.application,
    };
  }

  const tax = nonGroupTaxes?.find(({ id }) => id === itemId);

  if (!tax) {
    return;
  }

  return {
    value: tax.value,
    calculation: subConfig.calculation,
    application: subConfig.application,
  };
};

const findTaxOfType = (
  itemId: number,
  type: TaxType,
  district: TaxBusinessConfiguration,
  commercialTaxesUsed: boolean,
  skipPerOrderSpecialCase = false,
) => {
  const {
    commercialLineItems,
    commercialMaterials,
    commercialServices,
    nonCommercialLineItems,
    nonCommercialMaterials,
    nonCommercialServices,
  } = district;

  const lineItems = commercialTaxesUsed ? commercialLineItems : nonCommercialLineItems;
  const materials = commercialTaxesUsed ? commercialMaterials : nonCommercialMaterials;
  const services = commercialTaxesUsed ? commercialServices : nonCommercialServices;

  switch (type) {
    case TaxType.LineItem:
      // Per order line item taxes are an annoying special case handled separately.
      return skipPerOrderSpecialCase || lineItems.application !== TaxApplication.Order
        ? findTax(itemId, lineItems, {
            exclusions: lineItems.exclusions?.lineItems,
            nonGroup: lineItems.nonGroup?.lineItems,
          })
        : undefined;
    case TaxType.Threshold:
      // Per order line item taxes are an annoying special case handled separately.
      return skipPerOrderSpecialCase || lineItems.application !== TaxApplication.Order
        ? findTax(itemId, lineItems, {
            exclusions: lineItems.exclusions?.thresholds,
            nonGroup: lineItems.nonGroup?.thresholds,
          })
        : undefined;
    case TaxType.Material:
      return findTax(itemId, materials);
    case TaxType.Service:
      return findTax(itemId, services);
    default:
      throw new TypeError('Invalid tax type');
  }
};

const calculateTaxOnAmount = (
  tax: Pick<Tax, 'value' | 'calculation' | 'application'>,
  amount: number,
  quantity = 1,
) => {
  const value = Number(tax.value);

  if (tax.calculation === TaxCalculation.Percentage) {
    return mathRound2(value * (amount / 100));
  } else if (
    tax.application === TaxApplication.Ton ||
    tax.application === TaxApplication.Quantity
  ) {
    return mathRound2(quantity * value);
  } else {
    return value;
  }
};

const calculateTaxesForItemUSA = (
  { id, type, amount, quantity }: TaxableItem,
  districts: ResolvedDistricts,
  commercialTaxesUsed: boolean,
) =>
  districts.reduce((total, district) => {
    const tax = findTaxOfType(id, type, district, commercialTaxesUsed);

    if (tax) {
      return mathRound2(total + calculateTaxOnAmount(tax, amount, quantity));
    }

    return total;
  }, 0);

const calculateTaxesForItemCA = (
  { id, type, amount, quantity }: TaxableItem,
  districts: ResolvedDistricts,
  commercialTaxesUsed: boolean,
) => {
  let adjustedAmount = amount;
  let taxTotal = 0;
  let countryTax;

  const primaryDistrict = districts.find(
    (district) => district.districtType === TaxDistrictType.Primary,
  );
  const countryDistrict = districts.find(
    (district) => district.districtType === TaxDistrictType.Country,
  );

  const applyTaxOnTax = primaryDistrict?.includeNationalInTaxableAmount ?? false;

  if (countryDistrict) {
    const tax = findTaxOfType(id, type, countryDistrict, commercialTaxesUsed, true);

    taxTotal = tax ? calculateTaxOnAmount(tax, amount, quantity) : taxTotal;

    countryTax = tax;

    if (applyTaxOnTax) {
      adjustedAmount = mathRound2(amount + taxTotal);
    }
  }

  return districts.reduce(
    (total, district) => {
      if (district.districtType === TaxDistrictType.Country) {
        return total;
      }

      const tax = findTaxOfType(id, type, district, commercialTaxesUsed);

      if (!tax) {
        return total;
      }

      const taxableAmount =
        district.districtType === TaxDistrictType.Primary ? adjustedAmount : amount;

      const taxTotal = calculateTaxOnAmount(tax, taxableAmount, quantity);

      return mathRound2(total + taxTotal);
    },
    type === TaxType.Material ||
      type === TaxType.Service ||
      countryTax?.application !== TaxApplication.Order
      ? taxTotal
      : 0,
  );
};

const itemTaxesStrategies = {
  [Region.US]: calculateTaxesForItemUSA,
  [Region.CA]: calculateTaxesForItemCA,
  [Region.EU]: () => 0,
  [Region.GB]: () => 0,
};

export const calcOrderTaxes = ({
  taxDistricts,
  service,
  netWeight,
  serviceTotal,
  businessLineId,
  region,
  commercialTaxesUsed,
  lineItems = [],
  thresholds = [],
}: CalcOrderTaxesInput) => {
  const calculateTaxesForItem = itemTaxesStrategies[region];

  if (!calculateTaxesForItem) {
    return 0;
  }

  const itemsToTax: TaxableItem[] = [
    ...lineItems.map((item) => ({
      id: item.billableItemId as number,
      type: TaxType.LineItem,
      amount: mathRound2((item.price ?? 0) * (item.quantity ?? 1)),
      quantity: item.quantity,
    })),
    ...thresholds.map((item) => ({
      id: item.thresholdId as number,
      type: TaxType.Threshold,
      amount: mathRound2((item.price ?? 0) * (item.quantity ?? 1)),
      quantity: item.quantity,
    })),
  ];

  if (service?.billableServiceId) {
    itemsToTax.push({
      id: service.billableServiceId,
      type: TaxType.Service,
      amount: serviceTotal,
      quantity: netWeight,
    });
  }

  if (service?.materialId) {
    itemsToTax.push({
      id: service.materialId,
      type: TaxType.Material,
      amount: serviceTotal,
      quantity: netWeight,
    });
  }

  const districts = findConfigurations(taxDistricts, businessLineId);

  let taxesTotal = 0;

  itemsToTax.forEach((item) => {
    taxesTotal = mathRound2(
      taxesTotal + calculateTaxesForItem(item, districts, commercialTaxesUsed),
    );
  });

  if (lineItems.length || thresholds.length) {
    const lineItemsIds = lineItems.map(({ billableItemId }) => billableItemId) as number[];
    const thresholdIds = thresholds.map(({ thresholdId }) => thresholdId) as number[];

    districts.forEach(({ commercialLineItems, nonCommercialLineItems }) => {
      const lineItems = commercialTaxesUsed ? commercialLineItems : nonCommercialLineItems;

      if (lineItems.application !== TaxApplication.Order) {
        return;
      }

      const areAllItemsExcluded =
        lineItemsIds.every((id) => lineItems.exclusions?.lineItems.includes(id)) &&
        thresholdIds.every((id) => lineItems.exclusions?.thresholds.includes(id));

      if (areAllItemsExcluded) {
        return;
      }

      const amount = Number(lineItems.value);

      taxesTotal = mathRound2(taxesTotal + amount);
    });
  }

  return taxesTotal;
};

export const calcTaxesForOrderService = (
  service: { billableServiceId: number; materialId: number },
  calcTaxesInput: Omit<CalcOrderTaxesInput, 'service'>,
) => {
  return calcOrderTaxes({ ...calcTaxesInput, service, thresholds: [] });
};

export const formatTaxDistrictDescription = (description: string, separator = ';') =>
  description.replace(/(\r\n)/gm, separator);
