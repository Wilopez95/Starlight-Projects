import * as Yup from 'yup';

import { IDomain } from '@root/types';

export type DomainFormikData = {
  name: string;
  id?: number;
  provider?: string;
};

const defaultValues = {
  name: '',
  id: undefined,
  provider: undefined,
};

export const validationSchema = Yup.object().shape({
  name: Yup.string().required(),
});

export const getValues = (domain: IDomain | null): DomainFormikData => {
  if (!domain) {
    return defaultValues;
  }

  return {
    name: domain.name,
    id: domain.id,
    provider: '',
  };
};
