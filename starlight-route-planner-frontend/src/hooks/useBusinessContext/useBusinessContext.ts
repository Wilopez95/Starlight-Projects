import { useParams } from 'react-router';

import { BusinessParams, UseBusinessContextResponse } from './types';

export const useBusinessContext = (): UseBusinessContextResponse => {
  const { businessLine, businessUnit } = useParams<BusinessParams>();

  return {
    businessLineId: +businessLine,
    businessUnitId: +businessUnit,
  };
};
