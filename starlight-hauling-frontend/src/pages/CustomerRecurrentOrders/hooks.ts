import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';

import { IRecurrentOrderNavigation, RequestOptions } from './types';

export const useNavigation = (
  id: number,
  { customerId, businessUnitId }: RequestOptions,
): IRecurrentOrderNavigation[] => {
  return [
    {
      content: 'Main Information',
      to: pathToUrl(Paths.CustomerRecurrentOrderModule.MainInformation, {
        businessUnit: businessUnitId,
        customerId,
        id,
      }),
    },
    {
      content: 'Generated Orders',
      to: pathToUrl(Paths.CustomerRecurrentOrderModule.GeneratedOrders, {
        businessUnit: businessUnitId,
        customerId,
        id,
      }),
    },
  ];
};
