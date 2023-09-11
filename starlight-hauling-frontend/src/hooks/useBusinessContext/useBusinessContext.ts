import { useParams } from 'react-router';

import { useStores } from '../useStores';

import { BusinessParams, IUseBusinessContextResponse } from './types';

export const useBusinessContext = (): IUseBusinessContextResponse => {
  const { businessLine: businessLineId, businessUnit } = useParams<BusinessParams>();
  const { businessUnitStore } = useStores();

  const businessLine = businessUnitStore
    .getById(businessUnit)
    ?.businessLines.find(({ id }) => id === parseInt(businessLineId, 10));

  return {
    businessLineId,
    businessUnitId: businessUnit,
    businessLineType: businessLine?.type,
  };
};
