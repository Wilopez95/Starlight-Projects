import * as Yup from 'yup';
import { format } from 'date-fns';

import { IQbIntegration } from '@root/types';

export type QbIntegrationFormikData = {
  integrationBuList: number[];
  password: string;
  dateToAdjustment: number;
  lastSuccessfulIntegration: string;
  description: string;
  systemType: string;
  integrationPeriod: string;
};

const defaultValues = {
  integrationBuList: [],
  password: '',
  dateToAdjustment: 1,
  lastSuccessfulIntegration: format(new Date(), 'MM/dd/yyyy'),
  description: '',
  systemType: 'QBFS',
  integrationPeriod: format(new Date(), 'MM/dd/yyyy'),
};

export const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
});

export const getValues = (integration: IQbIntegration | null): QbIntegrationFormikData => {
  if (!integration) {
    return defaultValues;
  }

  return {
    integrationBuList: integration.integrationBuList as number[],
    password: '',
    dateToAdjustment: integration.dateToAdjustment,
    lastSuccessfulIntegration: integration.lastSuccessfulIntegration as string,
    description: integration.description as string,
    systemType: integration.systemType as string,
    integrationPeriod: integration.integrationPeriod as string,
  };
};
