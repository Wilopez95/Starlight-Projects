import * as yup from 'yup';
import i18n from '../../../i18n';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import { CustomerJobSiteOption } from '../Inputs/JobSiteInput';
import { CustomerTruckTypes, GetHaulingProjectsAllQuery } from '../../../graphql/api';
import { ObjectSchema } from 'yup';
import { CustomerTruckOption } from '../Inputs/CustomerTruckInput';
export const emptyTruckBypassScaleSchema = yup.object().shape({
  customer: yup.object().typeError(i18n.t('Required')).required(i18n.t('Required')),
  customerTruck: yup.object().nullable().required(i18n.t('Required')),
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
  totalWeight: yup.number().min(1, i18n.t('Required')).required(i18n.t('Required')),
  note: yup
    .string()
    .nullable()
    .max(250, i18n.t('MaxLength', { number: 250 })),
});
