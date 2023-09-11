import { TFunction } from 'i18next';

import { IOrderCustomRatesGroup } from '@root/api';

const I18N_PATH = 'helpers.getPriceType.';

export const getGlobalPriceType = (t: TFunction) => t(`${I18N_PATH}FromGlobal`);

export const getPriceType = (price: IOrderCustomRatesGroup, t: TFunction) => {
  if (price.customerId) {
    return t(`${I18N_PATH}FromCustomer`);
  }
  if (price.jobSiteId) {
    return t(`${I18N_PATH}FromJobSite`);
  }

  if (price.serviceAreaId) {
    return t(`${I18N_PATH}FromServiceArea`);
  }

  return t(`${I18N_PATH}FromCustomGroup`);
};
