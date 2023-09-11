import * as Yup from 'yup';
import { IQbIntegration } from '../../../../../../types';

const today = new Date();

export const getInitialValues = (): IQbIntegration =>
  ({
    password: '',
    integrationPeriod: today,
    dateToAdjustment: 0,
    integrationBuList: '',
  } as IQbIntegration);

export const generateValidationSchema = () =>
  Yup.object().shape({
    password: Yup.string(),
    integrationPeriod: Yup.date().required(),
    dateToAdjustment: Yup.number().required(),
    integrationBuList: Yup.string().required(),
  });
