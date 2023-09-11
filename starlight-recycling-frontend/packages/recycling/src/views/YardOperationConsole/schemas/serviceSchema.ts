import * as yup from 'yup';
//import { CustomerType } from '../../../graphql/api';
import i18n from '../../../i18n';

export const serviceSchema = yup.object().shape({
  // customerTruck: yup
  //   .object()
  //   .nullable()
  //   .optional()
  //   .test('truckEmptyWeightIsDefined', i18n.t('Must have tare weight'), function (customerTruck) {
  //     if (customerTruck && this.parent.bypassScale) {
  //       return !!customerTruck?.emptyWeight;
  //     }

  //     return true;
  //   })
  //   .when('customer', {
  //     is: (customer) => customer !== null && customer?.type !== CustomerType.Walkup,
  //     then: yup.object().required(i18n.t('Required')),
  //   }),
  // containerId: yup
  //   .number()
  //   .nullable()
  //   .positive(i18n.t('NumberPositive'))
  //   .test('containerEmptyWeightIsDefined', i18n.t('Must have tare weight'), function (containerId) {
  //     if (containerId && this.parent.bypassScale) {
  //       return !!this.parent.containerWeight;
  //     }

  //     return true;
  //   })
  //   .when('customerTruck', {
  //     is: (truck) => truck?.type === CustomerTruckTypes.Rolloff,
  //     then: yup.number().required(i18n.t('Required')),
  //   }),
  WONumber: yup
    .string()
    .nullable()
    .optional()
    .max(200, i18n.t('MaxLength', { number: 200 }))
    .when('customer', {
      is: (customer) => customer?.workOrderRequired,
      then: yup.string().required(i18n.t('Required')),
    }),
});
