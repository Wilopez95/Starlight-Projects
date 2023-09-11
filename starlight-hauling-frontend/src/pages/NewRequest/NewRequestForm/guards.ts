import { IOrderSelectCustomRatesResponse, IOrderSelectGlobalRatesResponse } from '@root/api';

import { INewOrderFormData } from './forms/Order/types';
import { INewRecurrentOrderFormData, RecurrentFormBasePath } from './forms/RecurrentOrder/types';

export const isCustomPriceGroup = (
  group: IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse,
): group is IOrderSelectCustomRatesResponse => {
  return group.level === 'custom';
};

export const isRecurrentOrder = (
  order: INewRecurrentOrderFormData | INewOrderFormData,
  basePath: RecurrentFormBasePath,
): order is INewRecurrentOrderFormData => {
  return !!order && basePath === 'recurrentTemplateData';
};

export const isRegularOrder = (
  order: INewRecurrentOrderFormData | INewOrderFormData,
  basePath: RecurrentFormBasePath,
): order is INewOrderFormData => {
  return !!order && ['delivery', 'final'].includes(basePath);
};
