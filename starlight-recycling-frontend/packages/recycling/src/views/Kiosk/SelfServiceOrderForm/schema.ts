import { isNull } from 'lodash-es';
import * as yup from 'yup';

import { CustomerTruckTypes, GetHaulingProjectsAllQuery } from '../../../graphql/api';
import i18n from '../../../i18n';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import { CustomerJobSiteOption } from '../../YardOperationConsole/Inputs/JobSiteInput';
import { ObjectSchema } from 'yup';

export const schema = yup.object().shape({
  customer: yup.object().typeError('Required').required('Required'),
  customerTruck: yup.object().nullable().required(i18n.t('Required')),
  containerId: yup
    .number()
    .nullable()
    .positive(i18n.t('NumberPositive'))
    .when('customerTruck', {
      is: (truck) => truck?.type === CustomerTruckTypes.Rolloff,
      then: yup.number().required(i18n.t('Required')),
    }),
  jobSite: yup
    .object()
    .nullable()
    .optional()
    .typeError('Required')
    .when('customer', {
      is: (customer) => customer?.jobSiteRequired,
      then: yup.object().required('Required'),
    }),
  project: yup
    .object()
    .nullable()
    .optional()
    .typeError('Required')
    .when('customerJobSite', {
      is: (customerJobSite) => customerJobSite?.projectRequired,
      then: yup.object().required('Required'),
    }),
  PONumber: yup
    .string()
    .nullable()
    .optional()
    .max(200, i18n.t('MaxLength', { number: 200 }))
    .when(
      ['customer', 'jobSite', 'project'],
      (
        customer: CustomerOption['customer'],
        customerJobSite: CustomerJobSiteOption['jobSite'],
        project: GetHaulingProjectsAllQuery['haulingProjects'][number],
        schema: ObjectSchema,
      ) => {
        if (customer?.poRequired || customerJobSite?.poRequired || project?.poRequired) {
          return schema.required(i18n.t('Required'));
        }

        return schema;
      },
    ),
  material: yup
    .object()
    .nullable()
    .required('Required')
    .when('customer', { is: (customer) => isNull(customer), then: yup.object().optional() }),
  WONumber: yup
    .string()
    .nullable()
    .required(i18n.t('Required'))
    .max(200, i18n.t('MaxLength', { number: 200 })),
  note: yup
    .string()
    .nullable()
    .max(250, i18n.t('MaxLength', { number: 250 })),
  requireOrigin: yup.boolean(),
  originDistrictId: yup
    .string()
    .nullable()
    .when('requireOrigin', { is: true, then: yup.string().nullable().required('Required') }),
  scale: yup.number().positive(),
});
