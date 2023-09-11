import { TaxApplication, TaxCalculation } from '@root/consts';
import { findTaxConfigurationByBusinessLineId } from '@root/helpers';
import { mathRound2 } from '@root/helpers/rounding';
import { IntlConfig } from '@root/i18n/types';
import {
  GroupLineItemTax,
  GroupTax,
  IEditableWorkOrder,
  ITaxDistrict,
  IWorkOrder,
  Tax,
} from '@root/types';

export type FormattedTax = {
  description: string;
  amount: number;
  basedOn?: string;
  calculation: string;
  hasAppliedSurcharges?: boolean;
};

export interface FormattableLineItem {
  description: string;
  quantity: number;
  isThreshold: boolean;
  price?: number;
  thresholdId?: number;
  billableLineItemId?: number;
  applySurcharges?: boolean;
}

export const formatServiceOrMaterialTax = (
  {
    taxDistrict,
    serviceTotal,
    itemCategory,
    businessLineId,
    itemId,
    itemName,
    workOrder,
    quantity,
    hasAppliedSurcharges,
    commercialTaxesUsed,
  }: {
    taxDistrict: ITaxDistrict;
    serviceTotal: number;
    itemCategory: 'materials' | 'services';
    businessLineId: number | string;
    quantity: number;
    commercialTaxesUsed: boolean;
    itemId?: number | null;
    itemName?: string;
    workOrder?: IWorkOrder | IEditableWorkOrder;
    hasAppliedSurcharges?: boolean;
  },
  { formatCurrency }: IntlConfig,
): FormattedTax | null => {
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

  const nonGroupTax = !tax.group && tax.nonGroup.find(({ id }: { id: number }) => id === itemId);

  if ((tax.group && tax.exclusions.includes(itemId)) || (!tax.group && !nonGroupTax)) {
    return null;
  }

  const value = (nonGroupTax as { value: string } | undefined)?.value ?? (tax as GroupTax).value;

  if (tax.calculation === TaxCalculation.Flat) {
    formattedValue = formatCurrency(Number(value));
    taxType = 'flat tax';

    if (tax.application === TaxApplication.Order) {
      application = 'per order';
      amount = Number(value) * quantity;
      calculation = `${formattedValue} * ${quantity} = ${formatCurrency(amount)}`;
    } else if (!workOrder || workOrder.weightUnit !== 'tons' || !workOrder.weight) {
      return null;
    } else {
      application = 'per ton';
      // `quantity` can only be 1 in this case
      amount = mathRound2(Number(value) * Number(workOrder.weight));
      calculation = `${formattedValue} * ${workOrder.weight} = ${formatCurrency(amount)}`;
      basedOn = `${workOrder.weight} tons`;
    }
  } else {
    application = 'per order';
    taxType = 'tax';
    formattedValue = `${value}%`;
    amount = mathRound2((Number(value) / 100) * (serviceTotal * quantity));
    basedOn = formatCurrency(mathRound2(serviceTotal));
    calculation = `${formattedValue} * ${basedOn} * ${quantity} = ${formatCurrency(amount)}`;
  }

  if (tax.group) {
    on = `on all ${itemCategory}`;
  } else {
    on = `on ${itemName as string}`;
  }

  return {
    description: `${formattedValue} ${taxType} ${application} ${on}`,
    calculation,
    amount,
    basedOn,
    hasAppliedSurcharges,
  };
};

export const formatLineItemsTaxes = (
  {
    taxDistrict,
    businessLineId,
    lineItems,
    quantity,
    commercialTaxesUsed,
  }: {
    taxDistrict: ITaxDistrict;
    businessLineId: number | string;
    quantity: number;
    lineItems: FormattableLineItem[];
    commercialTaxesUsed: boolean;
  },
  { formatCurrency }: IntlConfig,
): (FormattedTax & {
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
    const taxType = 'flat tax';
    const value = formatCurrency(Number(tax.value as string));
    const amount = Number(tax.value as string) * quantity;
    const calculation = `${value} * ${quantity} = ${formatCurrency(amount)}`;

    return [
      {
        description: `${value} ${taxType} per order on all line items`,
        amount,
        calculation,
        lineItem: lineItems[0],
        shouldDisplayLineItem: false,
      },
    ];
  }

  let application: string;

  if (tax.application === TaxApplication.Each) {
    application = 'per item';
  } else {
    application = 'per quantity';
  }

  const result: (FormattedTax & {
    lineItem: FormattableLineItem;
    shouldDisplayLineItem: true;
  })[] = [];

  lineItems?.forEach(lineItem => {
    const isThreshold = lineItem.isThreshold;

    const nonGroupTax =
      !tax.group &&
      (isThreshold
        ? tax.nonGroup.thresholds.find(({ id }) => id === lineItem.thresholdId)
        : tax.nonGroup.lineItems.find(({ id }) => id === lineItem.billableLineItemId));

    const isExcluded =
      tax.group &&
      ((isThreshold && tax.exclusions.thresholds.includes(lineItem.thresholdId as number)) ||
        (!isThreshold && tax.exclusions.lineItems.includes(lineItem.billableLineItemId as number)));

    if (isExcluded || (!tax.group && !nonGroupTax)) {
      return;
    }

    const value =
      (nonGroupTax as { value: string } | undefined)?.value ?? (tax as GroupLineItemTax).value;
    let calculation: string;
    let amount: number;
    let basedOn: string | undefined;
    let description: string;
    let formattedValue: string;

    const on = tax.group ? 'on all line items and thresholds' : `on ${lineItem.description}`;

    if (tax.calculation === TaxCalculation.Percentage) {
      formattedValue = `${value}%`;
      description = `${formattedValue} ${on}`;
      amount = mathRound2(
        (Number(value) / 100) *
          (Number(lineItem?.price) || 0) *
          (Number(lineItem?.quantity) || 0) *
          quantity,
      );
      calculation = `${formattedValue} * ${lineItem?.quantity} * ${quantity} * ${formatCurrency(
        lineItem.price,
      )} = ${formatCurrency(amount)}`;
      basedOn = formatCurrency(Number(lineItem?.price) || 0);
    } else {
      formattedValue = formatCurrency(Number(value));

      if (tax.application === TaxApplication.Each) {
        amount = Number(value) * quantity;
        calculation = `${formattedValue} * ${quantity} = ${formatCurrency(amount)}`;
      } else {
        amount = Number(value) * lineItem.quantity * quantity;
        calculation = `${formattedValue} * ${lineItem.quantity} * ${quantity} = ${formatCurrency(
          amount,
        )}`;
        basedOn = lineItem.quantity.toString();
      }

      description = `${formattedValue} flat tax ${application} ${on}`;
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
