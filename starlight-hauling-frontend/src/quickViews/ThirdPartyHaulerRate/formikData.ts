import { TFunction } from 'i18next';
import { differenceWith } from 'lodash-es';
import * as Yup from 'yup';

import {
  IThirdPartyHaulerCostsPayload,
  IThirdPartyHaulerCostsResponse,
} from '@root/api/thirdPartyHauler/types';
import { priceValidator } from '@root/helpers';
import { IBillableService } from '@root/types';

export const generateValidationSchema = (t: TFunction, i18n: string) => {
  return Yup.object().shape({
    thirdPartyHaulerCosts: Yup.array().of(
      Yup.object().shape({
        cost: Yup.number()
          .min(0, t(`${i18n}CostMustBeGreaterThanZero`))
          .test('cost', t(`${i18n}CostIncorrectFormat`), priceValidator)
          .nullable(),
      }),
    ),
  });
};

export interface IThirdPartyHaulerCostsFormData {
  thirdPartyHaulerCosts: IThirdPartyHaulerCostsPayload[];
}

const defaultValue: IThirdPartyHaulerCostsFormData = {
  thirdPartyHaulerCosts: [],
};

export const getValues = ({
  billableServices,
  businessLineId,
  items,
  materialId,
}: {
  billableServices: IBillableService[];
  businessLineId: number;
  items: IThirdPartyHaulerCostsResponse[];
  materialId: string | null;
}): IThirdPartyHaulerCostsFormData => {
  if (!items) {
    return defaultValue;
  }

  const thirdPartyHaulerCosts: IThirdPartyHaulerCostsPayload[] = billableServices.map(service => ({
    businessLineId,
    billableServiceId: service.id,
    materialId: materialId ? +materialId : null,
    cost: null,
  }));

  const diff = differenceWith(
    thirdPartyHaulerCosts,
    items,
    (item1, item2) => item1.billableServiceId.toString() === item2.billableServiceId.toString(),
  );

  return {
    thirdPartyHaulerCosts: [...items, ...diff],
  };
};
