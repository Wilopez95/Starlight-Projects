import { TaxApplication, TaxCalculation } from '@root/consts';
import { Regions } from '@root/i18n/config/region';
import { INewOrderService } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import {
  GroupLineItemTax,
  GroupTax,
  IBusinessConfig,
  IEditableWorkOrder,
  IEntity,
  IOrderLineItem,
  IOrderThreshold,
  ITaxDistrict,
  IWorkOrder,
  LineItemTax,
  NonGroupLineItemTax,
  NonGroupTax,
  NonGroupTaxValue,
  Tax,
  TaxDistrictType,
} from '@root/types';

import { mathRound2 } from './rounding';

export interface CalcOrderTaxesInput {
  commercialTaxesUsed: boolean;
  service: Pick<INewOrderService, 'billableServiceId' | 'materialId'>;
  serviceTotal: number;
  lineItems: Omit<IOrderLineItem, keyof IEntity>[];
  thresholds: Omit<IOrderThreshold, keyof IEntity>[];
  taxDistricts: ITaxDistrict[];
  businessLineId: string | number;
  workOrder?: IWorkOrder | IEditableWorkOrder;
  region: Regions;
}

const enum TaxType {
  LineItem = 'LineItem',
  Threshold = 'Threshold',
  Service = 'Service',
  Material = 'Material',
}

interface ResolvedTax {
  value: number | string;
  calculation: TaxCalculation;
  application: TaxApplication | null;
}

interface TaxableItem {
  id: number;
  type: TaxType;
  amount: number;
  quantity: number;
}

type ResolvedDistricts = (ITaxDistrict & IBusinessConfig)[];

export const findTaxConfigurationByBusinessLineId = (
  taxDistrict: ITaxDistrict,
  businessLineId: number | string,
) =>
  taxDistrict.businessConfiguration.find(district => +district.businessLineId === +businessLineId);

export const checkIfMaterialTaxable = (
  businessLineId: number | string,
  materialId: number,
  taxDistrict: ITaxDistrict,
  commercialTaxesUsed: boolean,
) => {
  const configuration = findTaxConfigurationByBusinessLineId(taxDistrict, businessLineId);

  if (configuration) {
    const tax =
      configuration[commercialTaxesUsed ? 'commercialMaterials' : 'nonCommercialMaterials'];

    const nonGroupTax =
      !tax.group && tax.nonGroup.find(({ id }: { id: number }) => id === materialId);

    if ((tax.group && tax.exclusions.includes(materialId)) || (!tax.group && !nonGroupTax)) {
      return false;
    }

    const value = Number(
      (nonGroupTax as { value: string } | undefined)?.value ?? (tax as GroupTax).value,
    );

    if (!Number.isNaN(value) && value > 0) {
      return true;
    }
  }

  return false;
};

const canCalculateWeightTax = (
  taxes: Tax,
  workOrder?: IWorkOrder | IEditableWorkOrder,
): workOrder is IWorkOrder | IEditableWorkOrder =>
  taxes.application !== TaxApplication.Ton ||
  (workOrder !== undefined && workOrder.weightUnit === 'tons' && workOrder.weight !== null);

const findConfigurations = (districts: ITaxDistrict[], businessLineId: number | string) =>
  districts.reduce<(ITaxDistrict & IBusinessConfig)[]>((result, district) => {
    const config = district.businessConfiguration.find(
      taxDistrict => +taxDistrict.businessLineId === +businessLineId,
    );

    if (config) {
      result.push({ ...district, ...config, id: district.id });
    }

    return result;
  }, []);

const findTax = (
  itemId: number,
  subConfig: Tax | LineItemTax,
  { exclusions, nonGroup }: { exclusions?: number[]; nonGroup?: NonGroupTaxValue } = {},
) => {
  const taxExclusions = exclusions ?? (subConfig as GroupTax).exclusions;
  const nonGroupTaxes = nonGroup ?? (subConfig as NonGroupTax).nonGroup;

  if (subConfig.group && taxExclusions.includes(itemId)) {
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
  district: ITaxDistrict & IBusinessConfig,
  { workOrder }: IOrderData,
  commercialTaxesUsed: boolean,
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
      return lineItems?.application === TaxApplication.Order
        ? undefined
        : findTax(itemId, lineItems, {
            exclusions: (lineItems as GroupLineItemTax)?.exclusions.lineItems,
            nonGroup: (lineItems as NonGroupLineItemTax)?.nonGroup?.lineItems,
          });
    case TaxType.Threshold:
      // Per order line item taxes are an annoying special case handled separately.
      return lineItems.application === TaxApplication.Order
        ? undefined
        : findTax(itemId, lineItems, {
            exclusions: (lineItems as GroupLineItemTax).exclusions.thresholds,
            nonGroup: (lineItems as NonGroupLineItemTax).nonGroup?.thresholds,
          });
    case TaxType.Material:
      return canCalculateWeightTax(materials, workOrder) ? findTax(itemId, materials) : undefined;
    case TaxType.Service:
      return canCalculateWeightTax(services, workOrder) ? findTax(itemId, services) : undefined;
    default:
      throw new TypeError('Invalid tax type');
  }
};

const calculateTaxOnAmount = (tax: ResolvedTax, amount: number, quantity = 1) => {
  const value = Number(tax.value);

  if (tax.calculation === TaxCalculation.Percentage) {
    return mathRound2(value * (amount / 100));
  }
  if (tax.application === TaxApplication.Ton || tax.application === TaxApplication.Quantity) {
    return mathRound2(quantity * value);
  }
  return value;
};

const calculateTaxesForItemUSA = (
  { id, type, amount, quantity }: TaxableItem,
  districts: ResolvedDistricts,
  orderData: IOrderData,
  commercialTaxesUsed: boolean,
) =>
  districts.reduce((total, district) => {
    const tax = findTaxOfType(id, type, district, orderData, commercialTaxesUsed);

    if (tax) {
      return mathRound2(total + calculateTaxOnAmount(tax, amount, quantity));
    }

    return total;
  }, 0);

interface IOrderData {
  workOrder?: IWorkOrder | IEditableWorkOrder;
}

const calculateTaxesForItemCA = (
  { id, type, amount, quantity }: TaxableItem,
  districts: ResolvedDistricts,
  orderData: IOrderData,
  commercialTaxesUsed: boolean,
) => {
  let adjustedAmount = amount;
  let taxTotal = 0;

  const primaryDistrict = districts.find(
    district => district.districtType === TaxDistrictType.Primary,
  );
  const countryDistrict = districts.find(
    district => district.districtType === TaxDistrictType.Country,
  );

  const applyTaxOnTax = primaryDistrict?.includeNationalInTaxableAmount ?? false;

  if (countryDistrict) {
    const tax = findTaxOfType(id, type, countryDistrict, orderData, commercialTaxesUsed);

    taxTotal = tax ? calculateTaxOnAmount(tax, amount, quantity) : taxTotal;

    if (applyTaxOnTax) {
      adjustedAmount = mathRound2(amount + taxTotal);
    }
  }

  return districts.reduce((total, district) => {
    if (district.districtType === TaxDistrictType.Country) {
      return total;
    }

    const tax = findTaxOfType(id, type, district, orderData, commercialTaxesUsed);

    if (!tax) {
      return total;
    }

    const taxableAmount =
      district.districtType === TaxDistrictType.Primary ? adjustedAmount : amount;

    taxTotal = calculateTaxOnAmount(tax, taxableAmount, quantity);

    return mathRound2(total + taxTotal);
  }, taxTotal);
};

const itemTaxesStrategies = {
  [Regions.US]: calculateTaxesForItemUSA,
  [Regions.CA]: calculateTaxesForItemCA,
  [Regions.EU]: () => 0,
  [Regions.GB]: () => 0,
};

export const calcOrderTaxes = ({
  taxDistricts,
  service,
  workOrder,
  serviceTotal,
  businessLineId,
  region,
  commercialTaxesUsed,
  lineItems = [],
  thresholds = [],
}: CalcOrderTaxesInput) => {
  const calculateTaxesForItem = itemTaxesStrategies[region];

  const itemsToTax: TaxableItem[] = [
    ...lineItems.map(item => ({
      id: item.billableLineItemId,
      type: TaxType.LineItem,
      amount: mathRound2((item.price ?? 0) * item.quantity),
      quantity: item.quantity,
    })),
    ...thresholds.map(item => ({
      id: item.thresholdId,
      type: TaxType.Threshold,
      amount: mathRound2(item.price * item.quantity),
      quantity: item.quantity,
    })),
  ];

  if (service.billableServiceId) {
    itemsToTax.push({
      id: service.billableServiceId,
      type: TaxType.Service,
      amount: serviceTotal,
      quantity: Number(workOrder?.weight ?? 1),
    });
  }

  if (service.materialId) {
    itemsToTax.push({
      id: service.materialId,
      type: TaxType.Material,
      amount: serviceTotal,
      quantity: Number(workOrder?.weight ?? 1),
    });
  }

  const districts = findConfigurations(taxDistricts, businessLineId);
  const orderData = { workOrder };

  let taxesTotal = 0;

  itemsToTax.forEach(item => {
    taxesTotal = mathRound2(
      taxesTotal + calculateTaxesForItem(item, districts, orderData, commercialTaxesUsed),
    );
  });

  if (lineItems.length || thresholds.length) {
    const lineItemsIds = lineItems.map(({ billableLineItemId }) => billableLineItemId);
    const thresholdIds = thresholds.map(({ thresholdId }) => thresholdId);

    districts.forEach(({ commercialLineItems, nonCommercialLineItems }) => {
      const lineItemsType = commercialTaxesUsed ? commercialLineItems : nonCommercialLineItems;

      if (lineItemsType.application !== TaxApplication.Order) {
        return;
      }

      const areAllItemsExcluded =
        lineItemsIds.every(id =>
          (lineItemsType as GroupLineItemTax).exclusions.lineItems.includes(id),
        ) &&
        thresholdIds.every(id =>
          (lineItemsType as GroupLineItemTax).exclusions.thresholds.includes(id),
        );

      if (areAllItemsExcluded) {
        return;
      }

      const amount = Number(lineItemsType.value);

      taxesTotal = mathRound2(taxesTotal + amount);
    });
  }

  return taxesTotal;
};

export const calcTaxesForOrderService = (
  service: INewOrderService,
  calcTaxesInput: Omit<CalcOrderTaxesInput, 'service'>,
) => calcOrderTaxes({ ...calcTaxesInput, service, thresholds: [] });
