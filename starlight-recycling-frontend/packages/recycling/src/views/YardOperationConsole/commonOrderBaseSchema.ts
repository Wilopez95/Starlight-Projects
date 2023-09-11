import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { CustomerTruckTypes, CustomerType, GetHaulingProjectsAllQuery } from '../../graphql/api';
import i18n from '../../i18n';
import { CustomerOption } from '../../components/FinalForm/CustomerSearchField';
import { CustomerJobSiteOption } from './Inputs/JobSiteInput';
import { CustomerTruckOption } from './Inputs/CustomerTruckInput';

export const commonOrderBaseSchema = yup.object().shape({
  customer: yup.object().typeError(i18n.t('Required')).required(i18n.t('Required')),
  project: yup
    .object()
    .nullable()
    .optional()
    .typeError(i18n.t('Required'))
    .when('jobSite', {
      is: (customerJobSite) => customerJobSite?.projectRequired,
      then: yup.object().required(i18n.t('Required')),
    }),
  customerTruck: yup
    .object()
    .nullable()
    .optional()
    .when('customer', (customer: CustomerOption['customer'], schema: yup.StringSchema) => {
      if (customer?.type !== CustomerType.Walkup) {
        return schema.required(i18n.t('Required'));
      }

      return schema;
    }),
  containerId: yup
    .number()
    .nullable()
    .optional()
    .when('customerTruck', (customerTruck: CustomerTruckOption['customerTruck'], schema: any) => {
      if (customerTruck && customerTruck.type === CustomerTruckTypes.Rolloff) {
        return schema.required(i18n.t('Required'));
      }

      return schema;
    }),
  PONumber: yup
    .string()
    .nullable()
    .optional()
    .max(200, i18n.t('MaxLength', { number: 200 }))
    .when(
      ['customer', 'jobSite', 'customerJobSite', 'project'],
      (
        customer: CustomerOption['customer'],
        jobSite: CustomerJobSiteOption['jobSite'],
        customerJobSite: CustomerJobSiteOption['jobSite'],
        project: GetHaulingProjectsAllQuery['haulingProjects'][number],
        schema: ObjectSchema,
      ) => {
        if (
          customer?.poRequired ||
          jobSite?.poRequired ||
          customerJobSite?.poRequired ||
          project?.poRequired
        ) {
          return schema.required(i18n.t('Required'));
        }

        return schema;
      },
    ),
  note: yup
    .string()
    .nullable()
    .max(250, i18n.t('MaxLength', { number: 250 })),
});
