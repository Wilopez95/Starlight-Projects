import { useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router';

import { Params, Routes } from '@root/core/consts';

const customerParam = Params.customerId.replace(':', '');

export const CustomerRedirect = () => {
  const history = useHistory();
  const routeParams = useParams<Record<string, string | undefined>>();

  const customerId = useMemo(() => routeParams[customerParam] || '', [routeParams]);

  useEffect(() => {
    history.replace(`/${Routes.Customers}/${customerId}/${Routes.Profile}`);
  }, [customerId, history]);

  return null;
};
