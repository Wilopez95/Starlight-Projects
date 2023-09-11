import * as Yup from 'yup';

import { IQbIntegrationLog } from '../../types/entities/qbIntegrationLog';

export type QbIntegrationLogFormikData = {
  type: string;
  lastSuccessfulIntegration: string;
  rangeFrom: string;
  rangeTo: string;
  integrationBuList: string[];
  paymentsTotal: string;
  statusCode: string;
  description: string;
};

const defaultValues = {
  type: '',
  lastSuccessfulIntegration: '',
  rangeFrom: '',
  rangeTo: '',
  integrationBuList: [],
  paymentsTotal: '',
  statusCode: '',
  description: '',
};

export const validationSchema = Yup.object().shape({
  // name: Yup.string().required(),
});

export const getValues = (log: IQbIntegrationLog | null): QbIntegrationLogFormikData => {
  if (!log) {
    return defaultValues;
  }

  return {
    type: log.type,
    lastSuccessfulIntegration: log.lastSuccessfulIntegration,
    rangeFrom: log.rangeFrom,
    rangeTo: log.rangeTo,
    integrationBuList: log.integrationBuList,
    paymentsTotal: log.paymentsTotal,
    statusCode: log.statusCode,
    description: log.description,
  };
};
