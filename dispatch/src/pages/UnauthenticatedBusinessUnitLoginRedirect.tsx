import { useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useUserContext } from '@root/auth/hooks/useUserContext';
import { Params, Routes } from '@root/routes/routing';

const businessUnitParam = Params.businessUnit.replace(':', '');

export const UnauthenticatedBusinessUnitLoginRedirect = () => {
  const { currentUser } = useUserContext();
  const tenantName = currentUser?.tenantName;
  const history = useHistory();
  const routeParams = useParams<Record<string, string | undefined>>();
  const businessUnit = useMemo(
    () => routeParams[businessUnitParam] ?? '',
    [routeParams],
  );
  useEffect(() => {
    if (!tenantName || !businessUnit) {
      history.push(`/${Routes.Lobby}`);

      return;
    }

    if (window.location.pathname.includes('login')) {
      return;
    }

    localStorage.setItem('redirectTo', window.location.href);

    history.push(
      `/${tenantName}/${Routes.BusinessUnits}/${businessUnit}/login`,
    );
  }, [businessUnit, history, tenantName]);

  return null;
};
