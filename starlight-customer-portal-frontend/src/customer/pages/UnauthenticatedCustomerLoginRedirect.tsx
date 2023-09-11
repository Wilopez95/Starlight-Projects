import { useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router';

import { StorageKeys } from '@root/auth/types/data-storage';
import { Params, Routes } from '@root/core/consts';

const customerIdParam = Params.customerId.replace(':', '');

export const UnauthenticatedCustomerLoginRedirect = () => {
  const history = useHistory();
  const routeParams = useParams<Record<string, string | undefined>>();
  const customerId = useMemo(() => routeParams[customerIdParam] || '', [routeParams]);

  useEffect(() => {
    if (!customerId) {
      history.push(`/${Routes.Lobby}`);

      return;
    }

    if (window.location.pathname.includes('login')) {
      return;
    }

    localStorage.setItem(StorageKeys.RedirectTo, window.location.href);

    history.push(`/${Routes.Customers}/${customerId}/login`);
  }, [customerId, history]);

  return null;
};
