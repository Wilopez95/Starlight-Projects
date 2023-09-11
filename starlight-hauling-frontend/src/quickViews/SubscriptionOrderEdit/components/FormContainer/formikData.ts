import { format } from 'date-fns';
import { TFunction } from 'i18next';
import { isDate } from 'lodash-es';
import * as Yup from 'yup';

import { isTimeAfter } from '@root/components/OrderTimePicker/helpers';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import { i18n } from '@root/i18n';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { ISubscriptionOrder, Maybe } from '@root/types';

const lineItemShape = {
  billableLineItemId: Yup.number().required(i18n.t('ValidationErrors.LineItemIsRequired')),
  price: Yup.number().required(i18n.t('ValidationErrors.PriceIsRequired')),
  quantity: Yup.number()
    .typeError(i18n.t('ValidationErrors.MustInteger'))
    .positive(i18n.t('ValidationErrors.MustBeGreaterThan0'))
    .required(i18n.t('ValidationErrors.QuantityIsRequired')),
};

export const generateValidationSchema = (t: TFunction) => {
  return Yup.lazy(values => {
    const { quantity } = values as ISubscriptionOrder;
    const validateItem = (value?: Maybe<string>) => {
      if (!value) {
        return true;
      }

      return value.split(',').length <= quantity;
    };

    return Yup.object().shape({
      serviceDate: Yup.date(),
      callOnWayPhoneNumber: Yup.string().nullable(),
      textOnWayPhoneNumber: Yup.string().nullable(),
      jobSiteContactId: Yup.number()
        .positive(t('ValidationErrors.JobSiteContactIsRequired'))
        .required(t('ValidationErrors.JobSiteContactIsRequired')),
      bestTimeToCome: Yup.string(),
      bestTimeToComeFrom: Yup.mixed()
        .nullable()
        .when('bestTimeToCome', {
          is: (bestTimeToCome: BestTimeToCome) => bestTimeToCome !== 'any',
          then: Yup.mixed().required(t(`ValidationErrors.TimeIsRequired`)),
        }),
      bestTimeToComeTo: Yup.mixed().when('bestTimeToCome', {
        is: (bestTimeToCome: BestTimeToCome) => bestTimeToCome !== 'any',
        then: Yup.mixed()
          .required(t(`ValidationErrors.TimeIsRequired`))
          .test(
            'bestTimeToComeTo',
            t(`ValidationErrors.MustBeGreaterThanFromTime`),
            function (date: Maybe<unknown>) {
              const timeFrom: string = isDate(this.parent.bestTimeToComeFrom)
                ? format(this.parent.bestTimeToComeFrom as number | Date, dateFormatsEnUS.time24)
                : this.parent.bestTimeToComeFrom;
              const timeTo = isDate(date) ? format(date, dateFormatsEnUS.time24) : (date as string);

              return isTimeAfter(timeFrom, timeTo);
            },
          ),
      }),
      subscriptionContactId: Yup.number().nullable(),
      promoId: Yup.number()
        .nullable()
        .when('promoApplied', {
          is: true,
          then: Yup.number().required(t('ValidationErrors.PromoIsRequired')),
        }),
      thirdPartyHaulerId: Yup.number().nullable(),
      instructionsForDriver: Yup.string()
        .max(256, t('ValidationErrors.PleaseEnterUpTo256characters'))
        .nullable(),
      route: Yup.string().max(120, t('ValidationErrors.Max120Chars')).nullable(),
      quantity: Yup.number()
        .integer(t('ValidationErrors.QuantityInteger'))
        .positive(t('ValidationErrors.QuantityGreaterZero'))
        .required(t('ValidationErrors.QuantityIsRequired')),
      purchaseOrderId: Yup.number().when(['poRequired', 'isOneTimePO'], {
        is: (poRequired, isOneTimePO) => poRequired && !isOneTimePO,
        then: Yup.number().required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
      }),
      oneTimePurchaseOrderNumber: Yup.string().when(['poRequired', 'isOneTimePO'], {
        is: (poRequired, isOneTimePO) => poRequired && !!isOneTimePO,
        then: Yup.string().required(t('ValidationErrors.PurchaseOrderNumberIsRequired')),
        otherwise: Yup.string(),
      }),
      permitId: Yup.number()
        .nullable()
        .when('permitRequired', {
          is: true,
          then: Yup.number().required(t('ValidationErrors.PermitIsRequired')),
        }),
      materialId: Yup.number().required(t('ValidationErrors.MaterialIsRequired')),
      billableServiceId: Yup.number().required(t('ValidationErrors.ServiceIsRequired')),
      lineItems: Yup.array().of(Yup.object().shape(lineItemShape)),
      droppedEquipmentItem: Yup.string()
        .nullable()
        .test(
          'lessThanQuantity',
          t(`ValidationErrors.ItemsNumberLessOrEqualQuantity`),
          validateItem,
        ),
      pickedUpEquipmentItem: Yup.string()
        .nullable()
        .test(
          'lessThanQuantity',
          t(`ValidationErrors.ItemsNumberLessOrEqualQuantity`),
          validateItem,
        ),
    });
  });
};
